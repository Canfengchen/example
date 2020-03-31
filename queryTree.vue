function queryTree(tree, id) {
  let stark = []
  stark = start.concat(tree)
  while(stark.length > 0){
    let tmp = stark.shift()
    if (tmp.children) {
      stark.concat(tmp.children)
    }
    if(tmp.id === id){
      return tmp.value
    }
  }
  return ''
}

tree结构
{
  id: '1',
  value: '1',
  children: [
    {
      id: '2',
      value: '2'
    }
  ]
}
