export default (state = {}, action) => {
 switch (action.type) {
  case 'SIMPLE_ACTION':
   return {
    serverSeedHash: action.payload
   }
  default:
   return state
 }
}
