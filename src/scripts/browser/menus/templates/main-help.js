import $ from '../expressions';

export default {
  label: '&Help',
  role: 'help',
  submenu: [{
    label: '&Visit our Website',
    click: $.openUrl('https://chatra.io/')
  }]
};
