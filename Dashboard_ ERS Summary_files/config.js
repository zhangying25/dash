window.MySherlock = {};

window.MySherlock.config = {
  ssadminserv : {
   url : "http://evpsadm02-slc-web.stratus.slc.ebay.com",
   contact : "DL-eBay-AppMon-Dev-US@corp.ebay.com",
   rulesByGroup : {
	   url : "${ssadminserv.rulesByGroup.url}"
   }
  },
  queryServer : {
    primary_url : "http://cmevpsqry.vip.stratus.slc.ebay.com:8080",
    capreserv_url : "http://cmevpsqry.vip.stratus.slc.ebay.com:8080"
  },
  mp : {
    environments : "Production:prod",
    queryServer : {
      primary_url : 'http://cmevpsqry.vip.stratus.slc.ebay.com:8080/',
      secondary_url : 'http://cmevpsqry.vip.stratus.lvs.ebay.com:8080/'
    },
    queryServerByProfile : {
      'lb' : 'http://cmevpsqry.vip.stratus.slc.ebay.com:8080/', // LVS for LB data
      'soa' : 'http://cmevpsqry.vip.stratus.slc.ebay.com:8080/', // SLC for perfmon and soa data
      'perfmon' : 'http://cmevpsqry.vip.stratus.slc.ebay.com:8080/', // SLC for perfmon and soa data
      'cassini' : 'http://cmevpsqry.vip.stratus.phx.ebay.com:8080/',
      'business' : 'http://cmevpsqry.vip.stratus.lvs.ebay.com:8080/',
      'atb' : 'http://cmevpsqry.vip.stratus.lvs.ebay.com:8080/',
      'besmon' : 'http://cmevpsqry.vip.stratus.slc.ebay.com:8080/',
      'default' : 'http://cmevpsqry.vip.stratus.lvs.ebay.com:8080/'
    }
  },
  pp : {
    environments : "Production:prod",
    queryServer : {
      primary_url : 'http://cmtsdb.vip.lvs.ebay.com/',
      secondary_url : 'http://cmtsdb.vip.phx.ebay.com/'
    },
    queryServerByProfile : {
      'default' : 'http://cmtsdb.vip.lvs.ebay.com/'
    }
  },
  alerts : {
	  url: "${alerts.url}"
  }
};
