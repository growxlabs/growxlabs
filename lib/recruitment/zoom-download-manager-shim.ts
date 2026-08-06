// Zoom 6.2.0 references this optional internal browser module, but does not
// publish it on npm. The SDK only uses it for optional download helpers.
const downloadManagerShim = {};
export default downloadManagerShim;
export { downloadManagerShim };
