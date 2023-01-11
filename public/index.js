
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  /**
   * @name initHeader
   * @description Initiates Kenzap Cloud extension header and related scripts. Verifies user sessions, handles SSO, does cloud space navigation, initializes i18n localization. 
   * @param {object} response
   */
  const initHeader = (response) => {

      // cache header from backend
      if(response.header) localStorage.setItem('header', response.header);
    
      // load header to html if not present
      if(!document.querySelector("#k-script")){
    
          let child = document.createElement('div');
          child.innerHTML = localStorage.getItem('header');
          child = child.firstChild;
          document.body.prepend(child);
    
          // run header scripts
          Function(document.querySelector("#k-script").innerHTML).call('test');
      }
    
      // load locales if present
      if(response.locale) window.i18n.init(response.locale); 
  };

  /*
   * Translates string based on preloaded i18n locale values.
   * 
   * @param text {String} text to translate
   * @param cb {Function} callback function to escape text variable
   * @param p {String} list of parameters, to be replaced with %1$, %2$..
   * @returns {String} - text
   */
  const __esc = (text, cb, ...p) => {

      let match = (input, pa) => {

          pa.forEach((p, i) => { input = input.replace('%'+(i+1)+'$', p); }); 
          
          return input;
      };

      if(typeof window.i18n === 'undefined') return match(text, p);
      if(window.i18n.state.locale.values[text] === undefined) return match(text, p);

      return match(cb(window.i18n.state.locale.values[text]), p);
  };

  /*
   * Converts special characters `&`, `<`, `>`, `"`, `'` to HTML entities and does translations
   * 
   * @param text {String}  text
   * @returns {String} - text
   */
  const __html = (text, ...p) => {

      text = String(text);

      if(text.length === 0){
  		return '';
  	}

      let cb = (text) => {

          return text.replace(/[&<>'"]/g, tag => (
              {
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  "'": '&apos;',
                  '"': '&quot;'
              } [tag]));
      };

      return __esc(text, cb, ...p);
  };

  /**
   * @name showLoader
   * @description Initiates full screen three dots loader.
   */
  const showLoader = () => {

      let el = document.querySelector(".loader");
      if (el) el.style.display = 'block';
  };

  /**
   * @name hideLoader
   * @description Removes full screen three dots loader.
   */
  const hideLoader = () => {

      let el = document.querySelector(".loader");
      if (el) el.style.display = 'none';
  };

  /**
   * @name initFooter
   * @description Removes full screen three dots loader.
   * @param {string} left - Text or html code to be present on the left bottom side of screen
   * @param {string} right - Text or html code to be present on the left bottom side of screen
   */
  const initFooter = (left, right) => {

      document.querySelector("footer .row").innerHTML = `
    <div class="d-sm-flex justify-content-center justify-content-sm-between">
        <span class="text-muted text-center text-sm-left d-block d-sm-inline-block">${left}</span>
        <span class="float-none float-sm-right d-block mt-1 mt-sm-0 text-center text-muted">${right}</span>
    </div>`;
  };

  /**
   * @name link
   * @description Handles Cloud navigation links between extensions and its pages. Takes care of custom url parameters.
   * @param {string} slug - Any inbound link
   * 
   * @returns {string} link - Returns original link with kenzp cloud space ID identifier.
   */
  const link = (slug) => {
      
      let urlParams = new URLSearchParams(window.location.search);
      let sid = urlParams.get('sid') ? urlParams.get('sid') : "";

      let postfix = slug.indexOf('?') == -1 ? '?sid='+sid : '&sid='+sid;

      return slug + postfix;
  };

  /**
   * @name spaceID
   * @description Gets current Kenzap Cloud space ID identifier from the URL.
   * 
   * @returns {string} id - Kenzap Cloud space ID.
   */
   const spaceID = () => {
      
      let urlParams = new URLSearchParams(window.location.search);
      let id = urlParams.get('sid') ? urlParams.get('sid') : "";

      return id;
  };

  /**
   * @name setCookie
   * @description Set cookie by its name to all .kenzap.cloud subdomains
   * @param {string} name - Cookie name.
   * @param {string} value - Cookie value.
   * @param {string} days - Number of days when cookie expires.
   */
   const setCookie = (name, value, days) => {

      let expires = "";
      if (days) {
          let date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = ";expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (escape(value) || "") + expires + ";path=/;domain=.kenzap.cloud"; 
  };

  /**
   * @name getCookie
   * @description Read cookie by its name.
   * @param {string} cname - Cookie name.
   * 
   * @returns {string} value - Cookie value.
   */
  const getCookie$1 = (cname) => {

      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  };

  /**
   * @name checkHeader
   * @description This function tracks UI updates, creates header version checksum and compares it after every page reload
   * @param {object} object - API response.
   */
   const checkHeader = () => {

      let version = (localStorage.hasOwnProperty('header') && localStorage.hasOwnProperty('header-version')) ? localStorage.getItem('header-version') : 0;
      let check = window.location.hostname + '/' + spaceID() + '/' + getCookie$1('locale');
      if(check != getCookie$1('check')){ version = 0; console.log('refresh'); }
      
      setCookie('check', check, 5);

      return version
  };

  /**
   * @name headers
   * @description Default headers object for all Kenzap Cloud fetch queries.
   * @param {object} headers
   */
   const H = () => {

      return {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getCookie$1('kenzap_api_key'),
          'Kenzap-Locale': getCookie$1('locale') ? getCookie$1('locale') : "en",
          'Kenzap-Header': checkHeader(),
          'Kenzap-Token': getCookie$1('kenzap_token'),
          'Kenzap-Sid': spaceID()
      }
  };

  /**
   * @name headers
   * @description Default headers object for all Kenzap Cloud fetch queries. 
   * @param {object} headers
   * @deprecated
   */
   ({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie$1('kenzap_api_key'),
      'Kenzap-Locale': getCookie$1('locale') ? getCookie$1('locale') : "en",
      'Kenzap-Header': checkHeader(),
      'Kenzap-Token': getCookie$1('kenzap_token'),
      'Kenzap-Sid': spaceID(),
  });

  /**
   * @name parseApiError
   * @description Set default logics for different API Error responses.
   * @param {object} object - API response.
   */
   const parseApiError = (data) => {

      // outout to frontend console
      console.log(data);

      // unstructured failure
      if(isNaN(data.code)){
      
          // structure failure data
          let log = data;
          try{ log = JSON.stringify(log); }catch(e){ }

          let params = new URLSearchParams();
          params.append("cmd", "report");
          params.append("sid", spaceID());
          params.append("token", getCookie$1('kenzap_token'));
          params.append("data", log);
          
          // report error
          fetch('https://api-v1.kenzap.cloud/error/', { method: 'post', headers: { 'Accept': 'application/json', 'Content-type': 'application/x-www-form-urlencoded', }, body: params });

          alert('Can not connect to Kenzap Cloud');  
          return;
      }
      
      // handle cloud error codes
      switch(data.code){

          // unauthorized
          case 401:

              // dev mode
              if(window.location.href.indexOf('localhost')!=-1){ 

                  alert(data.reason); 
                  return; 
              }

              // production mode
              location.href="https://auth.kenzap.com/?app=65432108792785&redirect="+window.location.href; break;
          
          // something else
          default:

              alert(data.reason); 
              break;
      }
  };

  /**
   * @name initBreadcrumbs
   * @description Render ui breadcrumbs.
   * @param {array} data - List of link objects containing link text and url. If url is missing then renders breadcrumb as static text. Requires html holder with .bc class.
   */
  const initBreadcrumbs = (data) => {

      let html = '<ol class="breadcrumb mt-2 mb-0">';
      for(let bc of data){
          
          if(typeof(bc.link) === 'undefined'){

              html += `<li class="breadcrumb-item">${ bc.text }</li>`;
          }else {

              html += `<li class="breadcrumb-item"><a href="${ bc.link }">${ bc.text }</a></li>`;
          }
      }
      html += '</ol>';
      
      document.querySelector(".bc").innerHTML = html;
  };

  /**
   * @name onClick
   * @description One row click event listener declaration. Works with one or many HTML selectors.
   * @param {string} sel - HTML selector, id, class, etc.
   * @param {string} fn - callback function fired on click event.
   */
  const onClick = (sel, fn) => {

      if(document.querySelector(sel)) for( let e of document.querySelectorAll(sel) ){

          e.removeEventListener('click', fn, true);
          e.addEventListener('click', fn, true);
      }
  };

  /**
   * Create a web friendly URL slug from a string.
   *
   * Requires XRegExp (http://xregexp.com) with unicode add-ons for UTF-8 support.
   *
   * Although supported, transliteration is discouraged because
   *     1) most web browsers support UTF-8 characters in URLs
   *     2) transliteration causes a loss of information
   *
   * @author Sean Murphy <sean@iamseanmurphy.com>
   * @copyright Copyright 2012 Sean Murphy. All rights reserved.
   * @license http://creativecommons.org/publicdomain/zero/1.0/
   *
   * @param string s
   * @param object opt
   * @return string
   */
   const slugify = (s, opt) => {

  	s = String(s);
  	opt = Object(opt);
  	
  	var defaults = {
  		'delimiter': '-',
  		'limit': undefined,
  		'lowercase': true,
  		'replacements': {},
  		'transliterate': (typeof(XRegExp) === 'undefined') ? true : false
  	};
  	
  	// Merge options
  	for (var k in defaults) {
  		if (!opt.hasOwnProperty(k)) {
  			opt[k] = defaults[k];
  		}
  	}
  	
  	var char_map = {
  		// Latin
  		'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç': 'C', 
  		'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 
  		'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Å': 'O', 
  		'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Å°': 'U', 'Ý': 'Y', 'Þ': 'TH', 
  		'ß': 'ss', 
  		'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c', 
  		'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 
  		'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'Å': 'o', 
  		'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'Å±': 'u', 'ý': 'y', 'þ': 'th', 
  		'ÿ': 'y',

  		// Latin symbols
  		'©': '(c)',

  		// Greek
  		'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': '8',
  		'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': '3', 'Ο': 'O', 'Π': 'P',
  		'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'X', 'Ψ': 'PS', 'Ω': 'W',
  		'Î': 'A', 'Î': 'E', 'Î': 'I', 'Î': 'O', 'Î': 'Y', 'Î': 'H', 'Î': 'W', 'Îª': 'I',
  		'Î«': 'Y',
  		'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'h', 'θ': '8',
  		'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': '3', 'ο': 'o', 'π': 'p',
  		'ρ': 'r', 'σ': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'x', 'ψ': 'ps', 'ω': 'w',
  		'Î¬': 'a', 'Î­': 'e', 'Î¯': 'i', 'Ï': 'o', 'Ï': 'y', 'Î®': 'h', 'Ï': 'w', 'ς': 's',
  		'Ï': 'i', 'Î°': 'y', 'Ï': 'y', 'Î': 'i',

  		// Turkish
  		'Å': 'S', 'Ä°': 'I', 'Ç': 'C', 'Ü': 'U', 'Ö': 'O', 'Ä': 'G',
  		'Å': 's', 'Ä±': 'i', 'ç': 'c', 'ü': 'u', 'ö': 'o', 'Ä': 'g', 

  		// Russian
  		'Ð': 'A', 'Ð': 'B', 'Ð': 'V', 'Ð': 'G', 'Ð': 'D', 'Ð': 'E', 'Ð': 'Yo', 'Ð': 'Zh',
  		'Ð': 'Z', 'Ð': 'I', 'Ð': 'J', 'Ð': 'K', 'Ð': 'L', 'Ð': 'M', 'Ð': 'N', 'Ð': 'O',
  		'Ð': 'P', 'Ð ': 'R', 'Ð¡': 'S', 'Ð¢': 'T', 'Ð£': 'U', 'Ð¤': 'F', 'Ð¥': 'H', 'Ð¦': 'C',
  		'Ð§': 'Ch', 'Ð¨': 'Sh', 'Ð©': 'Sh', 'Ðª': '', 'Ð«': 'Y', 'Ð¬': '', 'Ð­': 'E', 'Ð®': 'Yu',
  		'Ð¯': 'Ya',
  		'Ð°': 'a', 'Ð±': 'b', 'Ð²': 'v', 'Ð³': 'g', 'Ð´': 'd', 'Ðµ': 'e', 'Ñ': 'yo', 'Ð¶': 'zh',
  		'Ð·': 'z', 'Ð¸': 'i', 'Ð¹': 'j', 'Ðº': 'k', 'Ð»': 'l', 'Ð¼': 'm', 'Ð½': 'n', 'Ð¾': 'o',
  		'Ð¿': 'p', 'Ñ': 'r', 'Ñ': 's', 'Ñ': 't', 'Ñ': 'u', 'Ñ': 'f', 'Ñ': 'h', 'Ñ': 'c',
  		'Ñ': 'ch', 'Ñ': 'sh', 'Ñ': 'sh', 'Ñ': '', 'Ñ': 'y', 'Ñ': '', 'Ñ': 'e', 'Ñ': 'yu',
  		'Ñ': 'ya',

  		// Ukrainian
  		'Ð': 'Ye', 'Ð': 'I', 'Ð': 'Yi', 'Ò': 'G',
  		'Ñ': 'ye', 'Ñ': 'i', 'Ñ': 'yi', 'Ò': 'g',

  		// Czech
  		'Ä': 'C', 'Ä': 'D', 'Ä': 'E', 'Å': 'N', 'Å': 'R', 'Š': 'S', 'Å¤': 'T', 'Å®': 'U', 
  		'Å½': 'Z', 
  		'Ä': 'c', 'Ä': 'd', 'Ä': 'e', 'Å': 'n', 'Å': 'r', 'š': 's', 'Å¥': 't', 'Å¯': 'u',
  		'Å¾': 'z', 

  		// Polish
  		'Ä': 'A', 'Ä': 'C', 'Ä': 'e', 'Å': 'L', 'Å': 'N', 'Ó': 'o', 'Å': 'S', 'Å¹': 'Z', 
  		'Å»': 'Z', 
  		'Ä': 'a', 'Ä': 'c', 'Ä': 'e', 'Å': 'l', 'Å': 'n', 'ó': 'o', 'Å': 's', 'Åº': 'z',
  		'Å¼': 'z',

  		// Latvian
  		'Ä': 'A', 'Ä': 'C', 'Ä': 'E', 'Ä¢': 'G', 'Äª': 'i', 'Ä¶': 'k', 'Ä»': 'L', 'Å': 'N', 
  		'Š': 'S', 'Åª': 'u', 'Å½': 'Z', 
  		'Ä': 'a', 'Ä': 'c', 'Ä': 'e', 'Ä£': 'g', 'Ä«': 'i', 'Ä·': 'k', 'Ä¼': 'l', 'Å': 'n',
  		'š': 's', 'Å«': 'u', 'Å¾': 'z'
  	};
  	
  	// Make custom replacements
  	for (var k in opt.replacements) {
  		s = s.replace(RegExp(k, 'g'), opt.replacements[k]);
  	}
  	
  	// Transliterate characters to ASCII
  	if (opt.transliterate) {
  		for (var k in char_map) {
  			s = s.replace(RegExp(k, 'g'), char_map[k]);
  		}
  	}
  	
  	// Replace non-alphanumeric characters with our delimiter
  	var alnum = (typeof(XRegExp) === 'undefined') ? RegExp('[^a-z0-9]+', 'ig') : XRegExp('[^\\p{L}\\p{N}]+', 'ig');
  	s = s.replace(alnum, opt.delimiter);
  	
  	// Remove duplicate delimiters
  	s = s.replace(RegExp('[' + opt.delimiter + ']{2,}', 'g'), opt.delimiter);
  	
  	// Truncate slug to max. characters
  	s = s.substring(0, opt.limit);
  	
  	// Remove delimiter from ends
  	s = s.replace(RegExp('(^' + opt.delimiter + '|' + opt.delimiter + '$)', 'g'), '');
  	
  	return opt.lowercase ? s.toLowerCase() : s;
  };

  /**
   * @name toast
   * @description Triggers toast notification. Adds toast html to the page if missing.
   * @param {string} text - Toast notification.
   */
   const toast = (text) => {

      // only add once
      if(!document.querySelector(".toast")){

          let html = `
        <div class="toast-cont position-fixed bottom-0 p-2 m-4 end-0 align-items-center" style="z-index:10000;">
            <div class="toast hide align-items-center text-white bg-dark border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                <div class="d-flex">
                    <div class="toast-body"></div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>`;
          if(document.querySelector('body > div')) document.querySelector('body > div').insertAdjacentHTML('afterend', html);
      }

      let toast = new bootstrap.Toast(document.querySelector('.toast'));
      document.querySelector('.toast .toast-body').innerHTML = text;  
      toast.show();
  };

  var getCookie = function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  var getPageNumber = function getPageNumber() {
    var urlParams = new URLSearchParams(window.location.search);
    var page = urlParams.get('page') ? urlParams.get('page') : 1;
    return parseInt(page);
  };

  var HTMLContent = function HTMLContent(__) {
    return "\n        <div class=\"container p-edit\">\n            <div class=\"d-flex justify-content-between bd-highlight mb-3\">\n                <nav class=\"bc\" aria-label=\"breadcrumb\"></nav>\n                <div class=\"d-none-\">\n                    <button class=\"btn btn-primary btn-new-app d-flex align-items-center\" type=\"button\">\n                        <span class=\"d-flex\" role=\"status\" aria-hidden=\"true\">\n                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-plus-circle me-2\" viewBox=\"0 0 16 16\">\n                                <path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z\"/>\n                                <path d=\"M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z\"/>\n                        </span> ".concat(__html('New application'), "\n                    </button>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div id=\"mydata-chart\"></div>\n            </div>\n        </div>\n\n        <div class=\"modal\" tabindex=\"-1\">\n            <div class=\"modal-dialog\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <h5 class=\"modal-title\"></h5>\n                        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\n                    </div>\n                    <div class=\"modal-body\">\n\n                    </div>\n                    <div class=\"modal-footer\">\n                        <button type=\"button\" class=\"btn btn-primary btn-modal\"></button>\n                        <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\"></button>\n                    </div>\n                </div>\n            </div>\n        </div>\n        \n    ");
  };

  var Dashboard = _createClass(function Dashboard(_this, id) {
    var _this2 = this;
    _classCallCheck(this, Dashboard);
    _defineProperty(this, "getData", function () {
      if (_this2.state.firstLoad) showLoader();
      var s = "";
      fetch('https://api-v1.kenzap.cloud/', {
        method: 'post',
        headers: H(),
        body: JSON.stringify({
          query: {
            keys: {
              type: 'api-key',
              keys: ['private']
            },
            locale: {
              type: 'locale',
              id: getCookie('lang')
            },
            apps: {
              type: 'find',
              key: 'application',
              fields: ['_id', 'id', 'img', 'status', 'title', 'description', 'keywords', 'users', 'updated'],
              limit: _this2.state.limit,
              offset: s.length > 0 ? 0 : getPageNumber() * _this2.state.limit - _this2.state.limit,
              search: {
                field: 'title',
                s: s
              },
              sortby: {
                field: 'created',
                order: 'DESC'
              }
            },
            dashboard: {
              type: 'dashboard'
            }
          }
        })
      }).then(function (response) {
        return response.json();
      }).then(function (response) {
        if (response.success) {
          _this2.state.response = response;
          console.log(_this2.state.response);
          initHeader(response);
          _this2.html();
          _this2.render();
          _this2.listeners();
          initFooter(__('Created by %1$Kenzap%2$. ❤️ Licensed %3$GPL3%4$.', '<a class="text-muted" href="https://kenzap.com/" target="_blank">', '</a>', '<a class="text-muted" href="https://github.com/kenzap/apps" target="_blank">', '</a>'), '');
          _this2.state.firstLoad = false;
        } else {
          parseApiError(response);
        }
      })["catch"](function (error) {
        console.error('Error:', error);
      });
    });
    _defineProperty(this, "html", function () {
      document.querySelector('#contents').innerHTML = HTMLContent();
    });
    _defineProperty(this, "render", function () {
      var self = _this2;
      initBreadcrumbs([{
        link: link('https://dashboard.kenzap.cloud?launcher=mydata'),
        text: __('Home')
      }, {
        text: __('Applications')
      }]);
      am4core.useTheme(am4themes_animated);
      var chart = am4core.create("mydata-chart", am4plugins_forceDirected.ForceDirectedTree);
      var networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries());
      var myData = [];
      self.state.response.apps.forEach(function (el, i) {
        myData.push({
          name: el.title,
          value: 16
        });
      });
      networkSeries.data = myData;
      networkSeries.dataFields.linkWith = "linkWith";
      networkSeries.dataFields.category = "category";
      networkSeries.dataFields.name = "name";
      networkSeries.dataFields.id = "name";
      networkSeries.dataFields.value = "value";
      networkSeries.dataFields.children = "children";
      networkSeries.dataFields.fixed = "fixed";
      networkSeries.nodes.template.propertyFields.x = "x";
      networkSeries.nodes.template.propertyFields.y = "y";
      networkSeries.nodes.template.tooltipText = "{name}";
      networkSeries.nodes.template.fillOpacity = 1;
      networkSeries.nodes.template.label.text = "{name}";
      networkSeries.fontSize = 8;
      networkSeries.maxLevels = 3;
      networkSeries.nodes.template.label.hideOversized = true;
      networkSeries.nodes.template.label.truncate = true;
      networkSeries.nodes.template.draggable = true;
      networkSeries.nodePadding = 10;
      networkSeries.nodes.template.events.on("hit", function (ev) {
        self.state.modalCont = null;
        self.viewApp(ev.target.label.currentText);
      }, _this2);
      hideLoader();
    });
    _defineProperty(this, "listeners", function () {
      var self = _this2;
      if (!self.state.firstLoad) return;
      onClick('.btn-new-app', self.newApp);
    });
    _defineProperty(this, "newApp", function (e) {
      e.preventDefault();
      var self = _this2;
      if (self.state.modalCont || self.state.modal) self.state.modalCont.hide();
      var app = {
        title: "",
        description: "",
        keywords: ""
      };
      self.state.modal = document.querySelector(".modal");
      self.state.modalCont = new bootstrap.Modal(self.state.modal);
      history.pushState({
        pageID: 'Data'
      }, 'Data', window.location.pathname + window.location.search + "#modal");
      self.state.modal.querySelector(".modal-dialog").classList.add('modal-lg');
      self.state.modal.querySelector(".modal-header .modal-title").innerHTML = __html('Create Application');
      self.state.modal.querySelector(".modal-body").innerHTML = "\n\n            <div class=\"form-cont ge-form\">\n\n                <div class=\"form-group row mb-3\" >\n                    <label for=\"app-title\" class=\"form-label col-lg-3 col-form-label\">".concat(__html('Title'), "</label>\n                    <div class=\"col-lg-9\">\n                        <input type=\"text\" class=\"form-control form-control-lg\" id=\"app-title\" autocomplete=\"off\" placeholder=\"\" value=\"").concat(app.title, "\" maxlength=\"12\">\n                        <div class=\"invalid-feedback app-title-notice\"></div> \n                        <p class=\"form-text\">").concat(__html('Application title can be only defined once.'), "</p>\n                    </div>\n                </div>\n        \n                <div class=\"form-group row mb-3\">\n                    <label for=\"app-description\" class=\"form-label col-lg-3 col-form-label\">").concat(__html('Description'), "</label>\n                    <div class=\"col-lg-9\">\n                        <textarea id=\"app-description\" maxlength=\"1000\" class=\"form-control\" name=\"app-description\" >").concat(app.description, "</textarea>\n                        <div class=\"invalid-feedback app-description-notice\"></div>\n                        <ul class=\"list-group list-group-flush goods-suggestion mt-2\" style=\"font-size: 14px;max-height:120px;overflow:scroll;\">\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po \" style=\"cursor: pointer;\" data-i=\"0\">\n\n                                Deployments\n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n\n                            </li>\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po\" data-i=\"1\">\n                            \n                                Replicasets\n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n                                \n                            </li>\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po\" data-i=\"2\">\n\n                                Pods    \n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n\n                            </li>\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po\" data-i=\"3\">\n                            \n                                Services\n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n\n                            </li>\n                        </ul>\n                        <p class=\"form-text\">").concat(__html('Trade description of goods and marks and numbers, if any. Ex.: watch with serial #1234.'), "</p>\n                    </div>\n                    \n                </div>\n                \n                <div class=\"form-group row mb-3\">\n                    <label for=\"app-keywords\" class=\"form-label col-lg-3 col-form-label\">").concat(__html('Keywords'), "</label>\n                    <div class=\"col-lg-9\">\n                        <input type=\"text\" class=\"form-control form-control-lg\" id=\"app-keywords\" autocomplete=\"off\" placeholder=\"\" value=\"").concat(app.keywords, "\" maxlength=\"200\">\n                        <div class=\"invalid-feedback app-keywords-notice\"></div> \n                        <p class=\"form-text\">").concat(__html('Separate keywords by ",". Ex.: slider, banner, image.'), "</p>\n                    </div>\n                </div>\n\n            </div>");
      self.state.modal.querySelector('.modal-footer').innerHTML = "\n            <button type=\"button\" class=\"btn btn-primary btn-modal btn-update-app\">".concat(__html('Create'), "</button>\n            <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">").concat(__html('Close'), "</button>\n        ");
      self.state.modal.querySelector('.btn-update-app').addEventListener('click', function (e) {
        var data = {};
        data.title = self.state.modal.querySelector("#app-title").value.trim();
        data.description = self.state.modal.querySelector("#app-description").value.trim();
        data.keywords = self.state.modal.querySelector("#app-keywords").value.trim();
        data.status = "0";
        data.img = [];
        data.cats = [];
        if (data.title.length < 2) {
          alert(__('Please provide longer title'));
          return;
        }
        {
          fetch('https://api-v1.kenzap.cloud/', {
            method: 'post',
            headers: H(),
            body: JSON.stringify({
              query: {
                product: {
                  type: 'create',
                  key: 'application',
                  data: data
                }
              }
            })
          }).then(function (response) {
            return response.json();
          }).then(function (response) {
            if (response.success) {
              toast(__html('Application created'));
              self.state.modalCont.hide();
              self.getData();
            } else {
              parseApiError(response);
            }
          })["catch"](function (error) {
            parseApiError(error);
          });
        }
      });
      self.state.modalCont.show();
    });
    _defineProperty(this, "viewApp", function (title) {
      var self = _this2;
      slugify(title);
      var app = self.state.response.apps.filter(function (el) {
        return el.title == title;
      })[0];
      if (!app) return;
      self.state.modal = document.querySelector(".modal");
      self.state.modalCont = new bootstrap.Modal(self.state.modal);
      history.pushState({
        pageID: 'Data'
      }, 'Data', window.location.pathname + window.location.search + "#modal");
      self.state.modal.querySelector(".modal-dialog").classList.add('modal-lg');
      self.state.modal.querySelector(".modal-header .modal-title").innerHTML = title;
      self.state.modal.querySelector(".modal-body").innerHTML = "\n\n            <div class=\"form-cont ge-form\">\n                <img style=\"width:100%;max-height:300px;\" class=\"mb-3\" src=\"/assets/images/application-1.svg\">\n                <div class=\"form-group row mb-3 d-none\"\">\n                    <label for=\"app-title\" class=\"form-label col-lg-3 col-form-label\">".concat(__html('Title'), "</label>\n                    <div class=\"col-lg-9\">\n                        <input type=\"text\" class=\"form-control form-control-lg\" id=\"app-title\" autocomplete=\"off\" placeholder=\"\" value=\"").concat(app.title, "\" maxlength=\"12\">\n                        <div class=\"invalid-feedback app-title-notice\"></div> \n                        <p class=\"form-text\">").concat(__html('Application title can be only defined once.'), "</p>\n                    </div>\n                </div>\n        \n                <div class=\"form-group row mb-3\">\n                    <label for=\"app-description\" class=\"form-label col-lg-3 col-form-label\">").concat(__html('Description'), "</label>\n                    <div class=\"col-lg-9\">\n                        <textarea id=\"app-description\" maxlength=\"1000\" class=\"form-control\" name=\"app-description\" >").concat(app.description, "</textarea>\n                        <div class=\"invalid-feedback app-description-notice\"></div>\n                        <ul class=\"list-group list-group-flush goods-suggestion mt-2\" style=\"font-size: 14px;max-height:120px;overflow:scroll;\">\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po \" style=\"cursor: pointer;\" data-i=\"0\">\n\n                                Watch with serial #1234\n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n\n                            </li>\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po\" data-i=\"1\">\n                            \n                                BMW 535 WIN 15445432458 \n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n                                \n                            </li>\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po\" data-i=\"2\">\n\n                                Flash memory 8GB\n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n\n                            </li>\n                            <li class=\"list-group-item d-flex justify-content-between text-muted po\" data-i=\"3\">\n                            \n                                Golden ring 88888975\n                                <div class=\"\">\n                                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-files text-end po\" viewBox=\"0 0 16 16\" role=\"graphics-symbol\">\n                                        <path d=\"M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z\"/>\n                                    </svg>\n                                </div>\n\n                            </li>\n                        </ul>\n                        <p class=\"form-text\">").concat(__html('Trade description of goods and marks and numbers, if any. Ex.: watch with serial #1234.'), "</p>\n                    </div>\n                    \n                </div>\n                \n                <div class=\"form-group row mb-3\">\n                    <label for=\"app-keywords\" class=\"form-label col-lg-3 col-form-label\">").concat(__html('Keywords'), "</label>\n                    <div class=\"col-lg-9\">\n                        <input type=\"text\" class=\"form-control form-control-lg\" id=\"app-keywords\" autocomplete=\"off\" placeholder=\"\" value=\"").concat(app.keywords, "\" maxlength=\"200\">\n                        <div class=\"invalid-feedback app-keywords-notice\"></div> \n                        <p class=\"form-text\">").concat(__html('Separate keywords by ",". Ex.: slider, banner, image.'), "</p>\n                    </div>\n                </div>\n\n            </div>");
      self.state.modal.querySelector('.modal-footer').innerHTML = "\n            <button type=\"button\" class=\"btn btn-primary btn-modal btn-download-app\">".concat(__html('Get Boilerplate'), "</button>\n            <button type=\"button\" class=\"btn btn-primary btn-modal btn-update-app d-none\">").concat(__html('Create'), "</button>\n            <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">").concat(__html('Close'), "</button>\n        ");
      self.state.modalCont.show();
    });
    _defineProperty(this, "cache", function () {
      localStorage.setItem(_this2.id, JSON.stringify(_this2.state));
    });
    this.state = {
      firstLoad: true,
      html: '',
      data: {},
      ajaxQueue: 0,
      limit: 25,
      responseKey: [],
      modal: null,
      modalCont: null,
      editor: {}
    };
    this.getData();
  });
  new Dashboard();

})();
//# sourceMappingURL=index.js.map
