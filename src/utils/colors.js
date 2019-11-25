
const regionColors = {
  Midwest: '#FFD100',
  South: '#00A9C5',
  West: '#2A7DE1',
  Northeast: '#002D74'
}

const brandColors = {
  blue: '#324184',
  orange: '#E16150',
  lightGray: '#c5c5c5',
  mediumGray: '#9E9F9E',
  darkGray: '#777776',
  teal: '#069FB3',
  yellow: '#F9CC21',
  lightBlue: '#456EA7',
  darkBlue: '#456EA7'
}


const uiColors = {
  positive: '#4BB543',
  success: '#4BB543',
  failure: '#cc0000',
  negative: '#cc0000',
}

const getNumberColor = (n) => {
  if (n === 0) {
    return brandColors.darkGray;
  }

  if (n > 0) {
    return uiColors.success;
  }

  return uiColors.failure;
}

export { regionColors, brandColors, uiColors, getNumberColor };