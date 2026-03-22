import { GraphQLClient, gql } from 'graphql-request'

const endpoint = "https://api.goldsky.com/api/public/project_cmh0iv6s500dbw2p22vsxcfo6/subgraphs/creative-ip/1.0.1/gn"

const client = new GraphQLClient(endpoint)

const query = gql`
  query IntrospectIPRegistered {
    __type(name: "IPRegistered") {
      name
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`

client.request(query).then((res: any) => {
  console.log("Fields of IPRegistered:");
  res.__type.fields.forEach((f: any) => {
    console.log(`- ${f.name}: ${f.type.name || f.type.kind}`);
  });
}).catch(console.error)
