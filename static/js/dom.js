
function d(...args) {
  let tag = null;
  if (typeof args[0] === 'string') {
    tag = args.shift();
  }
  let attrs = {};
  let contents = [];
  args.forEach(function (arg) {
    if (arg instanceof DOM || arg instanceof Promise) {
      contents.push(arg);
    } else if (arg instanceof Array) {
      contents = contents.concat(arg);
    } else if (typeof arg === 'object') {
      for (let attr in arg) {
        attrs[attr] = arg[attr];
      }
    } else {
      contents.push(arg);
    }
  });
  return new DOM(tag, attrs, contents);
}

function DOM(tag, attrs, contents) {
  this.tag = tag;
  this.attrs = attrs || {};
  this.contents = contents || [];
}

DOM.prototype = {
  toString: function () {
    var s = '';
    if (this.tag) {
      s += '<' + this.tag;
      for (var attr in this.attrs) {
        s += ` ${attr}="${this.attrs[attr].replace('"', '\"')}"`;
      }
      s += '>';
    }

    this.contents.forEach(function (node) {
      s += node.toString();
    });

    if (this.tag) {
      s += '</' + this.tag + '>';
    }
    return s;
  },
  toDom: function () {
    var parent;
    if (this.tag) {
      parent = document.createElement(this.tag);
    } else {
      parent = document.createDocumentFragment();
    }

    var attrs = this.attrs;
    if (this.tag) {
      for (var attr in attrs) {
        parent.setAttribute(attr, attrs[attr]);
      }
    }

    this.contents.forEach(function (node) {
      if (node instanceof DOM) {
        parent.appendChild(node.toDom());
      } else if (node instanceof Promise) {
        var placeholder = document.createComment('placeholder');
        parent.appendChild(placeholder);
        node.then(function (val) {
          parent.insertBefore(d(val).toDom(), placeholder);
          parent.removeChild(placeholder);
        });
      } else {
        parent.appendChild(document.createTextNode(node));
      }
    });

    return parent;
  }
};
