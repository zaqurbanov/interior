# `.env.local` və Atlas təhlükəsizliyi

**Bölmə:** Yerləşdirmə (Vercel) · **Status:** açıq

> Lokal Blob token-i, istifadə olunmayan DB dəyişənlərinin silinməsi, Atlas şifrəsinin gücü.

## Addımlar

- [ ] Lokal yükləmə testi üçün `BLOB_READ_WRITE_TOKEN`-i Vercel-dən `.env.local`-a köçür (və ya `vercel env pull`)
- [ ] `.env.local`-dakı istifadə olunmayan `MONGODB_USER` / `MONGODB_PASS` dəyişənlərini sil (şifrə təkrarı)
- [ ] Atlas: Network Access `0.0.0.0/0` açıqdırsa, DB istifadəçisinin şifrəsinin güclü olduğuna əmin ol
