# Qənaət rejimi testi

**Bölmə:** Test · **Status:** bitib · **Tarix:** 2026-09-26

> `prefers-reduced-motion` və Data Saver ilə animasiyanın şəkil + mətnə çevrilməsi.

## Addımlar

- [x] `prefers-reduced-motion` ilə animasiya statik şəkil + bütün mərhələlər mətn kimi (ana səhifə, Windsor)
- [x] "Data Saver" və 2G ilə eyni davranış (`prefersLiteMedia()`); kadr/video sorğusu 240+ → 1 (yalnız ilk şəkil)

Qeyd: bu rejimdə ana səhifədə "Scroll to watch a blank canvas become a home." yazısı qalır, amma animasiya yoxdur — mətn admində (Site content → hero) dəyişə bilər; QA siyahısına düşdü.
