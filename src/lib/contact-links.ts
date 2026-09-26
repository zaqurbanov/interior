/** tel: link for a number as typed; the UK "(0)" is dropped ("+44 (0) 79 3148 6888" → "tel:+447931486888"). */
export const telHref = (phone: string) => `tel:${phone.replace(/\(0\)/g, "").replace(/[^\d+]/g, "")}`;

/** wa.me link with a prefilled message; the number without "+", spaces or a UK "(0)". */
export const whatsappHref = (number: string, text = "") => {
  const digits = number.replace(/\(0\)/g, "").replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
