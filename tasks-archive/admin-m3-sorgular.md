# Mərhələ 3 — Sorğular (mesajlar)

**Bölmə:** Admin panel · **Status:** bitib · **Tarix:** 2026-09-25 · **PR:** zaqurbanov/interior#1

> Sorğulara status, teq, qeydlər; axtarış və filtr; Resend ilə e-poçt; spam qoruması; CSV ixracı.

- [x] Status: yeni / cavablandı / təklif göndərildi / qazanıldı / itirildi (+ spam); teqlər, qeydlər, axtarış, filtr — `/admin/messages` ("Enquiries")
- [x] Yeni sorğuda studiyaya e-poçt (Reply-To = müştəri) və müştəriyə avtomatik "sorğunuz alındı" cavabı — Resend, `after()` ilə (forma gözləmir)
- [x] Spam qoruması: honeypot, 3 saniyədən tez göndərilən forma, IP üzrə limit (10 dəqiqədə 3, gündə 10), 3-dən çox link → "Spam" statusu. Turnstile əlavə edilmədi (lazım olsa sonra)
- [x] CSV ixracı (filtrlərə uyğun, Excel üçün UTF-8, formula inyeksiyasından qorunur)
- [x] Əlavə: əlaqə formu xəta olanda yazılanları silmirdi — düzəldildi; admin action-ları xəta atanda səhifə çökmürdü — düzəldildi

Qurulma (sizin tərəfinizdən): [tasks/resend-qurulmasi.md](../tasks/resend-qurulmasi.md).
