--
-- PostgreSQL database dump
--

\restrict cm5nYhHlp7WLZXvvqV0U8LNsNWSwPOLihzHhIMzZ7fSUULy923f6hlP0HA3XgaW

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-03 23:03:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 24580)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 24664)
-- Name: complaint_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaint_logs (
    id integer NOT NULL,
    complaint_id uuid NOT NULL,
    author_id uuid NOT NULL,
    message text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.complaint_logs OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24663)
-- Name: complaint_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complaint_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complaint_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 223
-- Name: complaint_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complaint_logs_id_seq OWNED BY public.complaint_logs.id;


--
-- TOC entry 222 (class 1259 OID 24627)
-- Name: complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaints (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ticket_number character varying(20) NOT NULL,
    student_id uuid NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'submitted'::character varying,
    assigned_department_id integer NOT NULL,
    is_anonymous boolean DEFAULT false,
    rejection_reason character varying(50) DEFAULT NULL::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT complaints_category_check CHECK (((category)::text = ANY ((ARRAY['academic'::character varying, 'facility'::character varying, 'behavioral'::character varying, 'financial'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT complaints_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT complaints_status_check CHECK (((status)::text = ANY ((ARRAY['submitted'::character varying, 'under_review'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[])))
);


ALTER TABLE public.complaints OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24592)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24591)
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 220
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- TOC entry 225 (class 1259 OID 32861)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(20) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    department_id integer,
    is_submission_blocked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4889 (class 2604 OID 24667)
-- Name: complaint_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_logs ALTER COLUMN id SET DEFAULT nextval('public.complaint_logs_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 24595)
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- TOC entry 4909 (class 2606 OID 24677)
-- Name: complaint_logs complaint_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_logs
    ADD CONSTRAINT complaint_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 24650)
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- TOC entry 4904 (class 2606 OID 24652)
-- Name: complaints complaints_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_ticket_number_key UNIQUE (ticket_number);


--
-- TOC entry 4898 (class 2606 OID 24603)
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- TOC entry 4900 (class 2606 OID 24601)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 32876)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4913 (class 2606 OID 32874)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 1259 OID 24690)
-- Name: idx_complaints_department_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaints_department_id ON public.complaints USING btree (assigned_department_id);


--
-- TOC entry 4906 (class 1259 OID 24689)
-- Name: idx_complaints_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaints_student_id ON public.complaints USING btree (student_id);


--
-- TOC entry 4907 (class 1259 OID 24688)
-- Name: idx_complaints_ticket_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaints_ticket_number ON public.complaints USING btree (ticket_number);


--
-- TOC entry 4915 (class 2606 OID 24678)
-- Name: complaint_logs complaint_logs_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_logs
    ADD CONSTRAINT complaint_logs_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- TOC entry 4914 (class 2606 OID 24658)
-- Name: complaints complaints_assigned_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_assigned_department_id_fkey FOREIGN KEY (assigned_department_id) REFERENCES public.departments(id) ON DELETE RESTRICT;


--
-- TOC entry 4916 (class 2606 OID 32877)
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


-- Completed on 2026-10-03 23:03:43

--
-- PostgreSQL database dump complete
--

\unrestrict cm5nYhHlp7WLZXvvqV0U8LNsNWSwPOLihzHhIMzZ7fSUULy923f6hlP0HA3XgaW

