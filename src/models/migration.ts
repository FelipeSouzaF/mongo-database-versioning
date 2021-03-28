import {Schema, model, Model, Document} from 'mongoose'

export const migration = (
  collectionName: string
): Model<Document> => {
  return model(
    'Migration',
    new Schema(
      {
        fileName: String,
        batch: Number,
      },
      {
        collection: collectionName,
      }
    )
  )
}