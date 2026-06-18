import logging
import time

from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .config import get_settings
from .database import Base, engine, get_db

settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(title="Ethara Inventory Orders API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
            return
        except OperationalError as e:
            retry_count += 1
            if retry_count >= max_retries:
                logger.warning(
                    "Database connection failed after %d attempts. "
                    "Tables will be created on first request. "
                    "Ensure DATABASE_URL is set and PostgreSQL is accessible.",
                    max_retries
                )
                return
            logger.info(f"Database connection attempt {retry_count} failed, retrying in 2 seconds...")
            time.sleep(2)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/products", response_model=list[schemas.ProductRead])
def products(db: Session = Depends(get_db)) -> list[models.Product]:
    return crud.list_products(db)


@app.post("/products", response_model=schemas.ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)) -> models.Product:
    return crud.create_product(db, payload)


@app.put("/products/{product_id}", response_model=schemas.ProductRead)
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)) -> models.Product:
    return crud.update_product(db, product_id, payload)


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Response:
    crud.delete_product(db, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/customers", response_model=list[schemas.CustomerRead])
def customers(db: Session = Depends(get_db)) -> list[models.Customer]:
    return crud.list_customers(db)


@app.post("/customers", response_model=schemas.CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)) -> models.Customer:
    return crud.create_customer(db, payload)


@app.put("/customers/{customer_id}", response_model=schemas.CustomerRead)
def update_customer(customer_id: int, payload: schemas.CustomerUpdate, db: Session = Depends(get_db)) -> models.Customer:
    return crud.update_customer(db, customer_id, payload)


@app.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)) -> Response:
    crud.delete_customer(db, customer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/orders", response_model=list[schemas.OrderRead])
def orders(db: Session = Depends(get_db)) -> list[models.Order]:
    return crud.list_orders(db)


@app.post("/orders", response_model=schemas.OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)) -> models.Order:
    return crud.create_order(db, payload)
