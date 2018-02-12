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
import dynamoHelper from './dynamoHelper'

export default ({ tableName, key='id' }, options = {}) => {
  let ids = []
  let dynamodb

  return (type, resource, params) => {
    dynamodb = dynamodb || dynamoHelper(new AWS.DynamoDB.DocumentClient(options))(tableName);

    switch (type) {

      case GET_ONE:
        return dynamodb.getOne({ key: {
            [ key ]: params.id,
          }})
          .then(data => ({ data }))

      case GET_MANY:
        let keys = params.ids.map(id => ({ [ key ]: id }))
        return dynamodb.batchGet({ keys })
          .then(data => ({ data }))

      case CREATE: 
        return dynamodb.putItem({
          attributes: params.data,
          options: {
            ConditionExpression: `attribute_not_exists(${key})`,
          },
        })

      case DELETE:
        return dynamodb.deleteItem({ key: {
            [ key ]: params.id,
          }})
          .then(data => ({ data }))

      case UPDATE:
        return dynamodb.putItem({
            attributes: {
              ...params.data,
              [ key ]: params.id,
            },
          })
          .then(data => ({ data }))        
        
      case GET_LIST:
        const { pagination } = params
        const { page, perPage } = pagination

        ids = ids.slice(0, perPage * page - perPage)

        const limit = perPage * page - ids.length
        const startKey = ids.length > 0 && { 
          [ key ]: ids[ids.length-1],
        }

        return dynamodb.scan({ limit, startKey })
          .then(({ results, hasMore }) => {
            let data = results.map(i => ({ ...i, id: i[key] }))
            ids = ids.concat(data.map(i => i.id))

            return {
              data: data.slice(perPage * -1),
              total: ids.length + (hasMore ? 1 : 0),
            }
          })

    }
  }
}