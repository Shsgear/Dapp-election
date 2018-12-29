App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  // 初始化入口函数
  init: async function() {
    return await App.initWeb3();
  },
  // 初始化web3
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  // 初始化合约
  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    })
  },
  
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data;
    web3.eth.getCoinbase(function(error, result) {
      if (error === null) {
        App.account = result;
        $("#accountAddress").html("Your Account: " + result);
      }
    });

    // load the contract data;
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var $candidateResults = $("#candidatesResults");
      $candidateResults.empty();
      for (let index = 0; index < candidatesCount.length; index++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // render candidates result;
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
        })
      }
      loader.hide();
      content.show();
    }).catch(function(err) {
      console.warn(err);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
