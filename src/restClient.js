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

const defaultKeyMapper = ({ id }) => ({ id })
export default ({ tableName, keyMapper=defaultKeyMapper }, options = {}) => {
  let cache = []
  let dynamodb

  return (type, resource, params) => {
    dynamodb = dynamodb || dynamoHelper(new AWS.DynamoDB.DocumentClient(options))(tableName);

    switch (type) {

      case GET_ONE:
        return dynamodb.getOne({ key: keyMapper(params)})
          .then(data => ({ data }))

      case GET_MANY:
        let keys = params.ids.map(keyMapper)
        return dynamodb.batchGet({ keys })
          .then(data => ({ data }))

      case CREATE: 
        return dynamodb.putItem({
          attributes: params.data,
          options: {
            ConditionExpression: `attribute_not_exists(id)`,
          },
        })

      case DELETE:
        return dynamodb.deleteItem({ key: keyMapper(params) })
          .then(data => ({ data }))

      case UPDATE:
        return dynamodb.putItem({
            attributes: {
              ...params.data,
              ...keyMapper(params),
            },
          })
          .then(data => ({ data }))        
        
      case GET_LIST:
        const { pagination, filter } = params
        const { page, perPage } = pagination

        cache = cache.slice(0, perPage * page - perPage)

        const limit = perPage * page - cache.length
        const startKey = cache.length > 0 && keyMapper(cache[cache.length-1]) 
        
        
        return dynamodb.scan({ limit, startKey })
          .then(({ results, hasMore }) => {
            cache = cache.concat(results)

            return {
              data: results.slice(perPage * -1),
              total: cache.length + (hasMore ? 1 : 0),
            }
          })

    }
  }
}