SPROXY
==========
  Sproxy is base on [xd-fetcher](https://github.com/ninozhang/xd-fetcher), it's a npm-cli tool for running a cross-domain 
proxy server quickly.Use __sproxy__ your can send cross-domain XHR request without same-origin policy error.

## Installation

    $ npm install sproxy -g
    
## Usage

  Runing a proxy server whith __port__ 
  
    $ sproxy -p 5001
    
  Use in your javascript ajax requesting
    
    $ http:///local-domain:port/json?url=encodeURIComponent(http://another-domain.com?search=sproxy)
