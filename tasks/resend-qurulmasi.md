# Resend (e-poçt) qurulması

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Sorğu bildirişləri və müştəriyə avtomatik cavab üçün Resend hesabı, domen təsdiqi və Vercel dəyişənləri.

## Təsvir

Kod hazırdır (Mərhələ 3). `RESEND_API_KEY` olmadan sorğular bazaya yazılır, amma e-poçt getmir; admin "Enquiries" səhifəsində bu barədə xəbərdarlıq görünür.

## Addımlar

- [ ] resend.com-da hesab aç (pulsuz plan kifayətdir)
- [ ] Domains → `vladimir-fasij.com` əlavə et, göstərilən DNS qeydlərini (SPF, DKIM) domen panelinə yaz, təsdiqini gözlə
- [ ] API Keys → yeni açar ("Sending access")
- [ ] Vercel → Environment Variables (Production + Preview):
  - `RESEND_API_KEY` = açar
  - `MAIL_FROM` = `Vladimir - Fasij <studio@vladimir-fasij.com>` (təsdiqlənmiş domendə istənilən ünvan)
  - `NOTIFY_EMAIL` = bildiriş gələcək ünvan(lar), vergüllə; boş qalsa Site content-dəki əlaqə e-poçtu
- [ ] Redeploy, sonra saytdan test sorğusu göndər: studiyaya bildiriş + müştəriyə cavab gəlməlidir

Domen təsdiqlənənə qədər Resend yalnız `onboarding@resend.dev` göndərəndən və yalnız hesab sahibinin ünvanına məktub göndərir.
