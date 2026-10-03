--
-- PostgreSQL database dump
--

\restrict JoMlekI2OgSVK67GTLgq2n0eQfO1RHI7g7r8Iv7IsNoP74bMfclp7dbMcJ6bWwe

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-03 23:04:33

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
-- TOC entry 5048 (class 0 OID 24592)
-- Dependencies: 221
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, email, created_at) FROM stdin;
1	Academic Affairs	academics@university.edu	2026-10-03 17:53:40.155388+08
2	Facilities & Management	facilities@university.edu	2026-10-03 17:53:40.155388+08
3	IT Support Services	itsupport@university.edu	2026-10-03 17:53:40.155388+08
4	Student Conduct & Affairs	studentconduct@university.edu	2026-10-03 17:53:40.155388+08
\.


--
-- TOC entry 5049 (class 0 OID 24627)
-- Dependencies: 222
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, ticket_number, student_id, title, description, category, priority, status, assigned_department_id, is_anonymous, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5051 (class 0 OID 24664)
-- Dependencies: 224
-- Data for Name: complaint_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaint_logs (id, complaint_id, author_id, message, is_internal, created_at) FROM stdin;
\.


--
-- TOC entry 5052 (class 0 OID 32861)
-- Dependencies: 225
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, password_hash, role, department_id, is_submission_blocked, created_at) FROM stdin;
2025-02907	Nadzmi Gapur Abah	ty202502907@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02697	Rovhic Chawee Alesna Ageas	ty202502697@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-01218	Ainee Hana Tan Ahamad	ty202501218@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02109	Amilhan Manceras Akbara	ty202502109@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-01689	Rhainiel Genesis G. Alavera	ty202501689@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02141	Jeric Linto Alvarez	ty202502141@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02972	Onyx Ferrer Bagarinao	ty202502972@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00580	Mutalib Alaja Bakili	ty202500580@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02122	Mohammad Ridzmar-Yaqeen Daham Bangahan	ty202502122@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02106	Christian Joshua Feliciano Cabual	ty202502106@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-01791	Sheina Love Abdulkadil Dela Cruz	ty202501791@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-01344	Archilles Halilong Espiritu	ty202501344@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-01246	Joshua Pepito Flores	ty202501246@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02969	Sam Daniel Galleposo	ty202502969@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02128	Rich Cezarina Layca Alfon Hitgano	ty202502128@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02864	Jheryanne Julian Mamantar	TY202502864@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02717	Allysa Navarro Mohammad	ty202502717@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-01220	Kris Mariane Dragon Pereyra	ty202501220@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00650	Carl Ian Reyes Prias	ty202500650@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-03364	Angel Grace Paing Puerto	TY202503364@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00538	Crisdianthy Lukuh Pula	ty202500538@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00296	Cassandra Ashley Bayabos Sailela	ty202500296@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00716	Kryzel Joy Salahop Solambao	ty202500716@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02680	Yllishedrine Hamdani Tagayan	ty202502680@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00169	Novie Jozane Dichoso Tamparong	ty202500169@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00272	Reymer Bolo Tarog	ty202500272@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2017-01278	Yvonne Redj Francisco Telan	lc201701278@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00326	Darell Deleon Tuble	ty202500326@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-00290	Ellice Rose Solano Vicente	ty202500290@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
2025-02601	Rurik Rae Rellon Villalobos	ty202502601@wmsu.edu.ph	password123	student	2	f	2026-10-03 19:11:54.445035+08
\.


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 223
-- Name: complaint_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaint_logs_id_seq', 1, false);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 220
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 37, true);


-- Completed on 2026-10-03 23:04:33

--
-- PostgreSQL database dump complete
--

\unrestrict JoMlekI2OgSVK67GTLgq2n0eQfO1RHI7g7r8Iv7IsNoP74bMfclp7dbMcJ6bWwe

