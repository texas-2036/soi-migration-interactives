
const isMobile = () => {
  return window.innerWidth < 800;
};

const isIE = () => {
  var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
  var msie = ua.indexOf('MSIE '); // IE 10 or older
  var trident = ua.indexOf('Trident/'); //IE 11

  return (msie > 0 || trident > 0);
}



export { isMobile, isIE }