import {
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE
} from 'admin-on-rest/lib/rest/types'

import AWS from 'aws-sdk'


export default ({ tableName, key='id' }, options = {}) => {
  let ids = []
  let dynamodb

  const recursiveBatchGet = (keys, results=[]) => {
    return dynamodb.batchGet({
      RequestItems: {
        [ tableName ]: {
          Keys: keys.slice(0, 100)
        }
      }
    }).promise()
    .then(({ Responses, UnprocessedKeys }) => {
      if (Responses.length == keys.length) 
        return results.concat(Responses)

      const nextKeys = UnprocessedKeys.Keys.concat(keys.slice(100))
      return recursiveBatchGet(nextKeys, results.concat(Responses))
    })         
  }

  const getOne = key => {
    return dynamodb.get({
      TableName: tableName,
      Key: key
    }).promise()
  }

  return (type, resource, params) => {
    dynamodb = dynamodb || new AWS.DynamoDB.DocumentClient(options);

    switch (type) {

      case GET_MANY:
        return recursiveBatchGet(params.ids.map(id => ({ [ key ]: id })))
          .then(data => ({ data }))
 

      case GET_ONE:
        return getOne({ [ key ]: params.id })
          .then(({ Item }) => ({ data: Item }))
        
      case GET_LIST:
        const { pagination } = params
        const { page, perPage } = pagination

        ids = ids.slice(0, perPage * page - perPage)

        const dynamodb = new AWS.DynamoDB.DocumentClient(options);
        const limit = perPage * page - ids.length

        const recursiveScan = (startKey, results=[]) => {
          return dynamodb.scan({
            TableName: tableName,
            Limit: limit - results.length,
            ExclusiveStartKey: startKey
          }).promise()
          .then(({ Items=[], LastEvaluatedKey }) => {
            let data = results.concat(Items.map(i => ({ ...i, id: i[key] })))

            if (LastEvaluatedKey && data.length < limit)
              return recursiveScan(LastEvaluatedKey, results)

            return { 
              data, 
              hasMore: !!LastEvaluatedKey,
            }
          
          })
        } 
        
        const lastItem = ids[ids.length-1]
        return recursiveScan(lastItem && { 
          [ key ]: lastItem,
        })
        .then(({ data, hasMore }) => {
          ids = ids.concat(data.map(i => i.id))

          return {
            data,
            total: ids.length + (hasMore ? 1 : 0),
          }
        })

    }
  }
}