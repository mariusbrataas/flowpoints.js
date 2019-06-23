//var GoogleSpreadsheet = require('google-spreadsheet');
//var request = require('request');
import axios from 'axios'

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

function rjust(msg, n, rep) {
  msg = '' + msg
  Array.from(Array(Math.max(0, n - msg.length)).keys()).map(idx => {
    msg = rep + msg
  })
  return msg
}

function num2test(num, lib) {
  if (!lib) {
    lib = '0123456789'
    lib += 'abcdefghijklmnopqrstuvwxyz'
    lib += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }
  if (num < lib.length) {
    return lib[num]
  } else {
    return num2test(Math.floor(num / lib.length)) + lib[num % lib.length]
  }
}

function getId2(l) {
  l = Math.min(20, Math.max(10, l || 15))
  var lib = '0123456789'
  lib += 'abcdefghijklmnopqrstuvwxyz'
  lib += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var msg = ''
  msg += Math.round(Math.random() * 100)
  var d = new Date()
  msg += rjust(d.getSeconds(), 2, 0)
  msg += rjust(d.getMinutes(), 2, 0)
  msg += rjust(d.getHours(), 2, 0)
  msg += rjust(d.getDate(), 2, 0)
  msg += rjust(d.getMonth(), 2, 0)
  msg += rjust(parseInt(d.getYear().toString().substring(1)), 2, 0)
  msg = num2test(msg, lib)
  Array.from(Array(l - msg.length).keys()).map(idx => {
    msg = lib[Math.round(Math.random() * (lib.length - 1))] + msg
  })
  return msg
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

// https://docs.google.com/forms/d/e/1FAIpQLSengBsi9gQZ0Od0xvUK8hrUXtlzYxJMeTgeepRCK_OPpfaelw/viewform?usp=pp_url&entry.32769032=kakesmak&entry.1926665398=fiskeost

export function postToDB(content, cb) {
  const mod_id = getId2();
  var url = 'https://docs.google.com/forms/d/e/1FAIpQLSengBsi9gQZ0Od0xvUK8hrUXtlzYxJMeTgeepRCK_OPpfaelw/formResponse?usp=pp_url'
  url += '&entry.32769032=' + mod_id;
  url += '&entry.1926665398=' + ReplaceAll(content, ' ', '+');
  url += '&submit=Submit'
  console.log(url)
  axios.get(url).then(res => {})
  cb(mod_id)
}

//https://docs.google.com/forms/d/e/1FAIpQLSfrs2Vx7yfwja-re-XXH_rJZphh--8wXZhYZthpefKGcj6KKQ/viewform?usp=sf_link
//https://docs.google.com/spreadsheets/d/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/edit?usp=sharing

//https://docs.google.com/spreadsheets/d/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/edit?usp=sharing

//https://spreadsheets.google.com/feeds/cells/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/1/public/full?alt=json
//https://spreadsheets.google.com/feeds/list/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/od6/public/values?alt=json-in-script&callback=

//https://docs.google.com/spreadsheets/d/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/export?format=csv&id=1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk&gid=0'

export function getDB(cb) {
  var res;
  axios.get('https://docs.google.com/spreadsheets/d/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/export?format=csv&id=1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk&gid=0').then(res => {
    var data = {};
    var raw = res.data.split('\r\n');
    var tmp;
    for (var idx = 1; idx < raw.length; idx++) {
      tmp = raw[idx].split(',')
      data[tmp[0]] = tmp[1]
    }
    cb(data)
  })
}

// gammel db:
// https://spreadsheets.google.com/feeds/list/1QwQIRXrPbanZr6cUw7u6d5sk3yiBuPiyup4JLpyBuuE/od6/public/basic?alt=json
/*export function getDB(cb) {
  var res;
  axios.get('https://spreadsheets.google.com/feeds/list/1qNBuXr5KIHPHqoNBgZEao2F3rAjBtMiQf6fsEDug0mk/od6/public/basic?alt=json').then(res => {
    console.log(res)
    var lib = {}
    res.data.feed.entry.map(entry => {
      lib[entry.title['$t']] = entry.content['$t'].split('content: ')[1]
    })
    cb(lib)
  })
}*/
