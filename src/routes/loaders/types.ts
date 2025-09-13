export type FetchPostApiResponse = {
  exhaustive: {
    nbHits: boolean
    typo: boolean
  }
  exhaustiveNbHits: boolean
  exhaustiveTypo: boolean
  hits: Array<{
    _highlightResult: {
      author: {
        matchLevel: string
        matchedWords: Array<any>
        value: string
      }
      title: {
        matchLevel: string
        matchedWords: Array<any>
        value: string
      }
      url: {
        matchLevel: string
        matchedWords: Array<any>
        value: string
      }
      story_text?: {
        matchLevel: string
        matchedWords: Array<any>
        value: string
      }
    }
    _tags: Array<string>
    author: string
    children: Array<number>
    created_at: string
    created_at_i: number
    num_comments: number
    objectID: string
    points: number
    story_id: number
    title: string
    updated_at: string
    url: string
    story_text?: string
  }>
  hitsPerPage: number
  nbHits: number
  nbPages: number
  page: number
  params: string
  processingTimeMS: number
  processingTimingsMS: {
    _request: {
      roundTrip: number
    }
    total: number
  }
  query: string
  serverTimeMS: number
}

export type FetchSinglePostApiResponse = {
  author: string
  children: Array<{
    author: string
    children: Array<{
      author: string
      children: Array<{
        author: string
        children: Array<any>
        created_at: string
        created_at_i: number
        id: number
        options: Array<any>
        parent_id: number
        points: any
        story_id: number
        text: string
        title: any
        type: string
        url: any
      }>
      created_at: string
      created_at_i: number
      id: number
      options: Array<any>
      parent_id: number
      points: any
      story_id: number
      text: string
      title: any
      type: string
      url: any
    }>
    created_at: string
    created_at_i: number
    id: number
    options: Array<any>
    parent_id: number
    points: any
    story_id: number
    text: string
    title: any
    type: string
    url: any
  }>
  created_at: string
  created_at_i: number
  id: number
  options: Array<any>
  parent_id: any
  points: number
  story_id: number
  text: any
  title: string
  type: string
  url: string
}
