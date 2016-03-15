import $ from '../expressions';

export default {
  label: '&Help',
  role: 'help',
  submenu: [{
    label: '&Email Support',
    click: $.openUrl('mailto:support@chatra.io')
  }, {
    label: '&Visit our Website',
    click: $.openUrl('https://chatra.io/')
  }]
};
