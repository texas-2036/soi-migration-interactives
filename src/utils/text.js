

const formatName = (name) => {
  return (name || '').replace(/County/g, '').trim();
}

const formatNumberShort = (x) => {
  if (x > 1000) {
    return `${Math.round(x / 1000)}k`;
  }
  return x;//Math.round(x / 100) * 100;
}

const formatNumber = (x) => {
  return (+x).toLocaleString();
}

export { formatName, formatNumberShort, formatNumber };