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
});