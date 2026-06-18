from decimal import Decimal
import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import crud, schemas
from app.database import Base


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_order_reduces_stock(db):
    product = crud.create_product(db, schemas.ProductCreate(name="Notebook", sku="NB-1", price=Decimal("9.99"), stock=5))
    customer = crud.create_customer(db, schemas.CustomerCreate(name="Ada", email="ada@example.com"))

    order = crud.create_order(
        db,
        schemas.OrderCreate(customer_id=customer.id, items=[schemas.OrderItemCreate(product_id=product.id, quantity=3)]),
    )

    assert order.total == Decimal("29.97")
    assert crud.list_products(db)[0].stock == 2


def test_order_rejects_insufficient_stock(db):
    product = crud.create_product(db, schemas.ProductCreate(name="Pen", sku="PEN-1", price=Decimal("1.50"), stock=1))
    customer = crud.create_customer(db, schemas.CustomerCreate(name="Grace", email="grace@example.com"))

    with pytest.raises(HTTPException) as exc:
        crud.create_order(
            db,
            schemas.OrderCreate(customer_id=customer.id, items=[schemas.OrderItemCreate(product_id=product.id, quantity=2)]),
        )

    assert exc.value.status_code == 400
    assert crud.list_products(db)[0].stock == 1
