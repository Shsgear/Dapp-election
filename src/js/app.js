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
      console.log('web3 provider: ', web3.currentProvider);
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
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
      
      App.listenOnEvents();

      return App.render();
    })
  },

  // 监听合约event
  listenOnEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // subscribe the event
      // arg1 pass a filter to event 
      // arg2 the metadata that represernts how many blocks we want to subscribe the event
      instance.votedEvent({}, {
        fromBlock: "latest",
        toBlock: 'latest'
      }).watch(function(err, event) {
        if (err) {
          return console.warn(err);
        }
        console.log("event triggered:  ", event);
        App.render();
      })
    })
  },


  render: function() {
    // console.log('render');
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
      console.log(instance);
      return electionInstance.candidatesCount();
    }).then(function(bnCandidatesCount) {
      // result is a BN(Big Number)
      var candidatesCount = bnCandidatesCount.toNumber();

      var $candidateResults = $("#candidatesResults");
      $candidateResults.empty();

      var $candidatesSelect = $('#candidatesSelect');
      $candidatesSelect.empty();

      // console.log(candidatesCount);
      var promises = [];
      for (let i = 1; i <= candidatesCount; i++) {
        promises.push(electionInstance.candidates(i));
        // electionInstance.candidates(i).then(function(candidate) {
          // var id = candidate[0].toNumber();
          // var name = candidate[1];
          // var voteCount = candidate[2].toNumber();
          // console.log(id, name, voteCount);
          // // render candidates result;
          // var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          // $candidateResults.append(candidateTemplate);

          // // Render candidate ballot option
          // var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          // candidatesSelect.append(candidateOption);
        // })
      }
      console.log("promises", promises);
      Promise.all(promises).then(function(candidates) {
        var $candidateResults = $("#candidatesResults");
        $candidateResults.empty();

        var $candidatesSelect = $('#candidatesSelect');
        $candidatesSelect.empty();

        candidates.forEach((candidate) => {
          var id = candidate[0].toNumber();
          var name = candidate[1];
          var voteCount = candidate[2].toNumber();

          // render candidates result;
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          $candidateResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          $candidatesSelect.append(candidateOption);
        })
        // var id = candidate[0].toNumber();
        // var name = candidate[1];
        // var voteCount = candidate[2].toNumber();
        // console.log(id, name, voteCount);
        // // render candidates result;
        // var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        // $candidateResults.append(candidateTemplate);

        // // Render candidate ballot option
        // var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
        // candidatesSelect.append(candidateOption);
      })
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      console.log(hasVoted)
      if (hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    })
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    console.log(candidateId);
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, {from: App.account});
    }).then(function(result) {
      console.log(result);
      // wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(error) {
      console.warn(error);
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
