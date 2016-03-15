import remote from 'remote';

const webView = document.getElementById('webView');
const manifest = remote.getGlobal('manifest');

// Load the app
log('loading', manifest.wvUrl);
webView.setAttribute('src', manifest.wvUrl);

export default webView;
