pragma solidity ^ 0.5 .0;

contract Election {
  // Model a candidate
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }
  // Store candidates
  // Fetch candidates
  // 将候选者以key->value (key为id, value为结构类型)形式映射。
  // 并最终以public公开所有candidates

  mapping(uint => Candidate) public candidates;


  // Store candidates count.uint Default to 0;
  // 因为不能通过mapping知道所有的数据大小
  // 随意输入一个id为99的也会返回一个空的candidate function.
  // 这个function也会返回默认的空的Candidate strucure
  uint public candidatesCount;

  constructor() public {
    // candidate = "Candidate 1";
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  // 每个候选人加入时id为当前的候选人的总数
  // 并向candidates添加候选人.
  // 默认的初始投票数为0
  function addCandidate(string memory _name) private {
    candidatesCount++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }
}