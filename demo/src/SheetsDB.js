import { CssBaseline } from '@material-ui/core';

var axios = require('axios');
var CryptoJS = require("crypto-js");


// Convert decimal number to base 62 number
function num2bigbase(num, lib) {
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


// Right justify
function rjust(msg, n, rep) {
    msg = '' + msg
    Array.from(Array(Math.max(0, n - msg.length)).keys()).map(idx => {
        msg = rep + msg
    })
    return msg
}


// Generate ID based on current date and time + some random values
function generate_id(l) {
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
    msg = num2bigbase(msg, lib)
    Array.from(Array(l - msg.length).keys()).map(idx => {
        msg = lib[Math.round(Math.random() * (lib.length - 1))] + msg
    })
    return msg
}


// Replace all
function ReplaceAll(str, search, replacement) {
    var newstr = ''
    str.split(search).map(val => {newstr += val + replacement})
    return newstr.substring(0, newstr.length - replacement.length)
}


// Specials lib
function getSpecialsLib(reversed) {
    var lib = {
      '§': '%C2%A7',
      '"': '%22',
      '#': '%23',
      '%': '%25',
      '&': '%26',
      '=': '%3D',
      '`': '%60',
      '^': '%5E',
      '+': '%2B',
      '´': '%C2%B4',
      '¨': '%C2%A8'
    }
    if (reversed) {
      var revlib = {}
      Object.keys(lib).map(key => {
        revlib[lib[key]] = key
      })
      return revlib
    }
    return lib
  }


// Encrypt
function Encrypt(data, key) {
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
    const specials = getSpecialsLib()
    Object.keys(specials).map(key => {
        encrypted = ReplaceAll(encrypted, key, specials[key])
    })
    return encrypted
}


export function sendToDB(id, data, passwd, id_length) {
    passwd = passwd || 'Hello world';
    const encrypted = Encrypt(data, passwd);
    const entry_id = generate_id(id_length);
    // URL
    var url = 'https://docs.google.com/forms/d/e/';
    url += id
    url += '/formResponse?usp=pp_url'
    url += 
}

function sendToDB(cb, document_id, entries, passwd, id_length) {
    const main_id = generate_id(id_length);
    passwd = passwd || 'Hello world';
    var url = 'https://docs.google.com/forms/d/e/' + document_id + '/formResponse?usp=pp_url'
    Object.keys(entries).map(entry_key => {
        url += '&entry.' + entry_key + '=' + Encrypt(entries[entry_key], passwd);
    })
    url += '&submid=Submit'
    axios.get(url).then(res => cb(res))
}