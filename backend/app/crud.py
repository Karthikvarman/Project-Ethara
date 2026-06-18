from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from . import models, schemas


def _commit_or_unique_error(db: Session, detail: str) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail) from exc


def list_products(db: Session) -> list[models.Product]:
    return db.query(models.Product).order_by(models.Product.id.desc()).all()


def create_product(db: Session, payload: schemas.ProductCreate) -> models.Product:
    product = models.Product(**payload.model_dump())
    db.add(product)
    _commit_or_unique_error(db, "Product SKU already exists")
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, payload: schemas.ProductUpdate) -> models.Product:
    product = db.get(models.Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)

    _commit_or_unique_error(db, "Product SKU already exists")
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = db.get(models.Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()


def list_customers(db: Session) -> list[models.Customer]:
    return db.query(models.Customer).order_by(models.Customer.id.desc()).all()


def create_customer(db: Session, payload: schemas.CustomerCreate) -> models.Customer:
    customer = models.Customer(**payload.model_dump())
    db.add(customer)
    _commit_or_unique_error(db, "Customer email already exists")
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: int, payload: schemas.CustomerUpdate) -> models.Customer:
    customer = db.get(models.Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)

    _commit_or_unique_error(db, "Customer email already exists")
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = db.get(models.Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    db.delete(customer)
    db.commit()


def list_orders(db: Session) -> list[models.Order]:
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
        .order_by(models.Order.id.desc())
        .all()
    )


def create_order(db: Session, payload: schemas.OrderCreate) -> models.Order:
    customer = db.get(models.Customer, payload.customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    quantities: dict[int, int] = {}
    for item in payload.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(quantities.keys()))
        .with_for_update()
        .all()
    )
    products_by_id = {product.id: product for product in products}

    missing_ids = sorted(set(quantities) - set(products_by_id))
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {', '.join(map(str, missing_ids))}",
        )

    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for SKU {product.sku}. Available: {product.stock}, requested: {quantity}",
            )

    total = Decimal("0.00")
    order = models.Order(customer_id=payload.customer_id, total=total)
    db.add(order)
    db.flush()

    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]
        line_total = product.price * quantity
        total += line_total
        product.stock -= quantity
        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                line_total=line_total,
            )
        )

    order.total = total
    db.commit()
    return get_order(db, order.id)


def get_order(db: Session, order_id: int) -> models.Order:
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product),
        )
        .filter(models.Order.id == order_id)
        .first()
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
