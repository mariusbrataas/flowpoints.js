//var GoogleSpreadsheet = require('google-spreadsheet');
//var request = require('request');
import axios from 'axios'
//https://docs.google.com/forms/d/e/1FAIpQLSfrs2Vx7yfwja-re-XXH_rJZphh--8wXZhYZthpefKGcj6KKQ/viewform?usp=pp_url&entry.1418173025=demo&entry.1980854326=fiskelisk
function ReplaceAll(str, search, replacement) {
  var msg = ''
  str.split(search).map(sub => {
    msg += sub + replacement
  })
  return msg.substring(0, msg.length - replacement.length)
}

function num2string(num) {
  return num.toString(36)
}
//AIzaSyC2xSmTdMOwyfYJNWgRI0AZolpKgPft8a0
function string2num(str) {
  return parseInt(str, 36)
}

function getId(l) {
  l = Math.min(20, Math.max(10, l || 15))
  var msg = ''
  const lib = 'abcdefghijklmnopqrstuvwxyz0123456789'
  var d = new Date();
  msg += num2string(parseInt(d.getYear().toString().substring(1)))
  msg += num2string(d.getMonth() * 30 + d.getDate())
  msg += num2string(d.getHours())
  msg += num2string(d.getMinutes())
  msg += num2string(d.getSeconds())
  Array.from(Array(l - msg.length).keys()).map(idx => {
    msg += lib[Math.floor(Math.random() * lib.length)];
  })
  return msg
}

export function postToDB(content, cb) {
  const mod_id = getId();
  var url = 'https://docs.google.com/forms/d/e/1FAIpQLSfrs2Vx7yfwja-re-XXH_rJZphh--8wXZhYZthpefKGcj6KKQ/formResponse?usp=pp_url'
  url += '&entry.1418173025=' + mod_id;
  url += '&entry.1980854326=' + content;
  url += '&submit=Submit'
  axios.get(url).then(res => {})
  cb(mod_id)
}

//https://docs.google.com/forms/d/e/1FAIpQLSfrs2Vx7yfwja-re-XXH_rJZphh--8wXZhYZthpefKGcj6KKQ/viewform?usp=sf_link
export function getDB(cb) {
  var res;
  axios.get('https://spreadsheets.google.com/feeds/list/1QwQIRXrPbanZr6cUw7u6d5sk3yiBuPiyup4JLpyBuuE/od6/public/basic?alt=json').then(res => {
    var lib = {}
    res.data.feed.entry.map(entry => {
      lib[entry.title['$t']] = entry.content['$t'].split('content: ')[1]
    })
    cb(lib)
  })
}
