const timeout = ms => new Promise(res => setTimeout(res, ms))

export default docClient => {
	async function scan({ tableName, limit, startKey }) {
		let results = []
		let hasMore = true

		while (hasMore && results.length < limit || !limit) {
			let { Items=[], LastEvaluatedKey } = await docClient.scan({
				TableName: tableName,
				Limit: limit,
				ExclusiveStartKey: startKey || undefined,
			}).promise()

			results = results.concat(Items)
			startKey = LastEvaluatedKey
			hasMore = !!LastEvaluatedKey
		}

		return {
			results,
			hasMore,
		}
	}

	async function batchGet({ tableName, keys }) {
		let results = []
		let i = 0
		while (keys.length > 0 ) {
			let Keys = keys.splice(0, 100)
	    let { Responses, UnprocessedKeys } = await docClient.batchGet({
	      RequestItems: {
	        [ tableName ]: { Keys }
	      }
	    }).promise()

	   	results = results.concat(Responses)
	   	
	   	let remaining = UnprocessedKeys.Keys
	    if (remaining.length > 0) {
	    	await timeout(Math.random() * remaining.length)
	    	keys = remaining.concat(keys)
	    }
		}

		return results
	}


  const getOne = ({ tableName, key }) => {
    return docClient.get({
      TableName: tableName,
      Key: key
    }).promise()
    .then(({ Item }) => Item)
  }


	return {
		scan,
		batchGet,
		getOne,
	}
}