export const formatDateToTime = (isoString: string) => {
  const date = new Date(isoString);
  const localTime = date.toLocaleTimeString();
  return localTime;
};

export const formatDateToDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const localDateTime = date.toLocaleString();
  return localDateTime;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

export const smoothScrollTo = (elementId: string, offset: number = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementRect = element.getBoundingClientRect().top;
    const offsetPosition = elementRect + window.pageYOffset - offset;

    requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    });
  }
};

export const smoothScrollToTop = () => {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
};
