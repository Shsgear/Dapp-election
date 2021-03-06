var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;
  it('initalizes with two candidates', function() {
    // console.log(accounts);
    return Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 2);
    });
  });

  it('it initalizes the candidates with te correct values', function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "Contain the correct id");
      assert.equal(candidate[1], "Candidate 1", "Contain the correct name");
      assert.equal(candidate[2], 0, "Contain the correct voteCount");
      return electionInstance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "Contain the correct id");
      assert.equal(candidate[1], "Candidate 2", "Contain the correct name");
      assert.equal(candidate[2], 0, "Contain the correct voteCount");
    })
  });

  it('it allows a voter to cast a vote', function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] })
    }).then(function(voteResult) {
      assert.equal(voteResult.receipt.status, true, 'vote result status true');
      var logs = voteResult.logs;
      assert.equal(logs.length, 1, "an event was triggered");
      assert.equal(logs[0].event,"votedEvent", "the event type is correct");
      assert.equal(logs[0].args._candidateId.toNumber(), candidateId, "the event was triggered with a correct candidate id");
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, 'the voter was marked as voted');
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });

  it('throws an exception for invalid candidates', function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') > -1, "error message must contain revert");
      return electionInstance.candidates(1)
    }).then(function(candidate1) {
      var voteCount = candidate1[2].toNumber();
      assert.equal(voteCount, 1, "candidate 1 did not recieve any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2].toNumber();
      assert.equal(voteCount, 0, "candidate 2 did not recieve any votes");
    })
  })

  it("throw a exception for double voting when using the same address", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      electionInstance.vote(candidateId, { from: accounts[1] })
      return electionInstance.candidates(2);
    }).then(function(candidate) {
      var voteCount = candidate[2].toNumber();
      assert.equal(voteCount, 1, "accept first vote");
      // try to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') > -1, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2].toNumber();
      assert.equal(voteCount, 1, "candidate 1 shouldn't receive more vote");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2].toNumber();
      assert.equal(voteCount, 1, "candidate 2 shouldn't receive more vote");
    })
  })
});