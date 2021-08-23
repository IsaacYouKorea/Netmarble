import TYPE from "./type";

function getNode(name, weight, hash) {
  let node = hash[name];
  if (!node) {
    node = {
      name: name,
      type: TYPE.NODE,
      weight: weight,
      children: [],
      root: true,
    };
    hash[name] = node;
  }
  return node;
}

function getCondition(name, hash) {
  let cNode = hash[name];
  if (!cNode) {
    cNode = { name: name, type: TYPE.CONDITION, children: [] };
  }
  return cNode;
}

function createNodes(line, hash) {
  let fNode, lNode, rNode, cNode;
  fNode = getNode(line.F_Node, line.F_Weight, hash);
  lNode = getNode(line.L_Node, line.L_Weight, hash);
  rNode = getNode(line.R_Node, line.R_Weight, hash);
  cNode = getCondition(line.Condition, hash);
  lNode.root = false;
  rNode.root = false;
  cNode.children.push(lNode, rNode);
  fNode.children.push(cNode);
}

function convertData(csv) {
  const nodeHash = {};
  for (const line of csv) {
    createNodes(line, nodeHash);
  }
  const data = Object.keys(nodeHash).map((key) => nodeHash[key]);
  console.log('>>', data);
  const rootData = data.filter((node) => node.root);
  console.log(rootData);
  const min = data.reduce((acc, node) => {
    if (+node.weight < acc) return +node.weight;
    return acc;
  }, Number.POSITIVE_INFINITY);
  const max = data.reduce((acc, node) => {
    if (+node.weight > acc) return +node.weight;
    return acc;
  }, Number.NEGATIVE_INFINITY);
  return {
    data:rootData,
    min,
    max
  };
}

export default convertData;
