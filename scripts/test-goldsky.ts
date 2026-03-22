import { GraphQLClient, gql } from 'graphql-request'

const endpoint = "https://api.goldsky.com/api/public/project_cmh0iv6s500dbw2p22vsxcfo6/subgraphs/creative-ip/1.0.1/gn"

const client = new GraphQLClient(endpoint)

const query = gql`
  query GetRecentIPAssets {
    ipregistereds(first: 5, orderBy: timestamp_, orderDirection: desc) {
      id
      ipId
      chainId
      tokenContract
      tokenId
      uri
      timestamp_
      transactionHash_
    }
  }
`

client.request(query).then(console.log).catch(err => {
  console.dir(err, { depth: null })
})
