-- public.customers definition

-- Drop table

-- DROP TABLE public.customers;

CREATE TABLE public.customers (
	customer_id serial4 NOT NULL,
	customer_name varchar NULL,
	customer_contact varchar NULL,
	address varchar NULL,
	city varchar NULL,
	postal_code int4 NULL,
	country varchar NULL,
	CONSTRAINT customers_pk PRIMARY KEY (customer_id)
);


-- public.products definition

-- Drop table

-- DROP TABLE public.products;

CREATE TABLE public.products (
	product_id serial4 NOT NULL,
	"name" varchar NULL,
	description varchar NULL,
	unit_price numeric NULL,
	"size" varchar NULL,
	CONSTRAINT products_pk PRIMARY KEY (product_id)
);


-- public.orders definition

-- Drop table

-- DROP TABLE public.orders;

CREATE TABLE public.orders (
	order_id serial4 NOT NULL,
	total_price numeric NULL,
	date_ordered timestamptz NULL,
	customer_id int4 NULL,
	quantity int4 NULL,
	product_id int4 NULL,
	CONSTRAINT orders_pk PRIMARY KEY (order_id),
	CONSTRAINT orders_customers_fk FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id)
);