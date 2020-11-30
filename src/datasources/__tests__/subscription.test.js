import nock from 'nock'

jest.mock('uuid', () => ({ v4: () => '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed' }))

import {
  deleteSubscription as subscriptionSourceDelete,
  fetchSubscription as subscriptionSourceFetch,
  ingestSubscription as subscriptionSourceIngest
} from '../subscription'

let requestInfo

describe('subscription#fetch', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetAllMocks()

    jest.restoreAllMocks()

    process.env = { ...OLD_ENV }

    process.env.cmrRootUrl = 'http://example.com'

    // Default requestInfo
    requestInfo = {
      name: 'subscriptions',
      alias: 'subscriptions',
      args: {},
      fieldsByTypeName: {
        SubscriptionList: {
          items: {
            name: 'items',
            alias: 'items',
            args: {},
            fieldsByTypeName: {
              Subscription: {
                conceptId: {
                  name: 'conceptId',
                  alias: 'conceptId',
                  args: {},
                  fieldsByTypeName: {}
                }
              }
            }
          }
        }
      }
    }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('cursor', () => {
    beforeEach(() => {
      // Overwrite default requestInfo
      requestInfo = {
        name: 'subscriptions',
        alias: 'subscriptions',
        args: {},
        fieldsByTypeName: {
          SubscriptionList: {
            cursor: {
              name: 'cursor',
              alias: 'cursor',
              args: {},
              fieldsByTypeName: {}
            },
            items: {
              name: 'items',
              alias: 'items',
              args: {},
              fieldsByTypeName: {
                Subscription: {
                  conceptId: {
                    name: 'conceptId',
                    alias: 'conceptId',
                    args: {},
                    fieldsByTypeName: {}
                  },
                  emailAddress: {
                    name: 'emailAddress',
                    alias: 'emailAddress',
                    args: {},
                    fieldsByTypeName: {}
                  }
                }
              }
            }
          }
        }
      }
    })

    test('returns a cursor', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Hits': 84,
          'CMR-Took': 7,
          'CMR-Request-Id': 'abcd-1234-efgh-5678',
          'CMR-Scroll-Id': '-98726357'
        })
        .post(/subscriptions\.umm_json/)
        .reply(200, {
          items: [{
            meta: {
              'concept-id': 'SUB100000-EDSC'
            },
            umm: {
              EmailAddress: 'test@example.com'
            }
          }]
        })

      const response = await subscriptionSourceFetch({}, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        count: 84,
        cursor: 'eyJ1bW0iOiItOTg3MjYzNTcifQ==',
        items: [{
          conceptId: 'SUB100000-EDSC',
          emailAddress: 'test@example.com'
        }]
      })
    })

    describe('when a cursor is requested', () => {
      test('requests a cursor', async () => {
        nock(/example/)
          .defaultReplyHeaders({
            'CMR-Hits': 84,
            'CMR-Took': 7,
            'CMR-Request-Id': 'abcd-1234-efgh-5678',
            'CMR-Scroll-Id': '-98726357'
          })
          .post(/subscriptions\.umm_json/, 'scroll=true')
          .reply(200, {
            items: [{
              meta: {
                'concept-id': 'SUB100000-EDSC'
              },
              umm: {
                EmailAddress: 'test@example.com'
              }
            }]
          })

        const response = await subscriptionSourceFetch({}, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'collection')

        expect(response).toEqual({
          count: 84,
          cursor: 'eyJ1bW0iOiItOTg3MjYzNTcifQ==',
          items: [{
            conceptId: 'SUB100000-EDSC',
            emailAddress: 'test@example.com'
          }]
        })
      })
    })
  })

  describe('without params', () => {
    test('returns the parsed subscription results', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Hits': 84,
          'CMR-Took': 7,
          'CMR-Request-Id': 'abcd-1234-efgh-5678'
        })
        .post(/subscriptions\.json/)
        .reply(200, {
          items: [{
            concept_id: 'SUB100000-EDSC'
          }]
        })

      const response = await subscriptionSourceFetch({}, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        count: 84,
        cursor: 'e30=',
        items: [{
          conceptId: 'SUB100000-EDSC'
        }]
      })
    })
  })

  describe('with params', () => {
    test('returns the parsed subscription results', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Hits': 84,
          'CMR-Took': 7,
          'CMR-Request-Id': 'abcd-1234-efgh-5678'
        })
        .post(/subscriptions\.json/, 'concept_id=SUB100000-EDSC')
        .reply(200, {
          items: [{
            concept_id: 'SUB100000-EDSC'
          }]
        })

      const response = await subscriptionSourceFetch({ concept_id: 'SUB100000-EDSC' }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        count: 84,
        cursor: 'e30=',
        items: [{
          conceptId: 'SUB100000-EDSC'
        }]
      })
    })
  })

  describe('with json and umm keys', () => {
    beforeEach(() => {
      // Overwrite default requestInfo
      requestInfo = {
        name: 'subscriptions',
        alias: 'subscriptions',
        args: {},
        fieldsByTypeName: {
          ToolList: {
            items: {
              name: 'items',
              alias: 'items',
              args: {},
              fieldsByTypeName: {
                Tool: {
                  conceptId: {
                    name: 'conceptId',
                    alias: 'conceptId',
                    args: {},
                    fieldsByTypeName: {}
                  },
                  emailAddress: {
                    name: 'emailAddress',
                    alias: 'emailAddress',
                    args: {},
                    fieldsByTypeName: {}
                  }
                }
              }
            }
          }
        }
      }
    })
  })

  describe('with only umm keys', () => {
    beforeEach(() => {
      // Overwrite default requestInfo
      requestInfo = {
        name: 'subscriptions',
        alias: 'subscriptions',
        args: {},
        fieldsByTypeName: {
          SubscriptionList: {
            items: {
              name: 'items',
              alias: 'items',
              args: {},
              fieldsByTypeName: {
                Subscription: {
                  emailAddress: {
                    name: 'emailAddress',
                    alias: 'emailAddress',
                    args: {},
                    fieldsByTypeName: {}
                  }
                }
              }
            }
          }
        }
      }
    })

    test('returns the parsed subscription results', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Hits': 84,
          'CMR-Took': 7,
          'CMR-Request-Id': 'abcd-1234-efgh-5678'
        })
        .post(/subscriptions\.umm_json/)
        .reply(200, {
          items: [{
            meta: {
              'concept-id': 'SUB100000-EDSC'
            },
            umm: {
              EmailAddress: 'test@example.com'
            }
          }]
        })

      const response = await subscriptionSourceFetch({ concept_id: 'SUB100000-EDSC' }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        count: 84,
        cursor: 'e30=',
        items: [{
          emailAddress: 'test@example.com'
        }]
      })
    })
  })

  test('catches errors received from queryCmrSubscriptions', async () => {
    nock(/example/)
      .post(/subscriptions/)
      .reply(500, {
        errors: ['HTTP Error']
      }, {
        'cmr-request-id': 'abcd-1234-efgh-5678'
      })

    await expect(
      subscriptionSourceFetch({ conceptId: 'SUB100000-EDSC' }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')
    ).rejects.toThrow(Error)
  })
})

describe('subscription#ingest', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetAllMocks()

    jest.restoreAllMocks()

    process.env = { ...OLD_ENV }

    process.env.cmrRootUrl = 'http://example.com'

    // Default requestInfo
    requestInfo = {
      name: 'createSubscription',
      alias: 'createSubscription',
      args: {
        collectionConceptId: 'C100000-EDSC',
        emailAddress: 'test@example.com',
        name: 'Test Subscription',
        query: 'polygon=-18,-78,-13,-74,-16,-73,-22,-77,-18,-78',
        subscriberId: 'testuser'
      },
      fieldsByTypeName: {
        SubscriptionMutationResponse: {
          conceptId: {
            name: 'conceptId',
            alias: 'conceptId',
            args: {},
            fieldsByTypeName: {}
          },
          revisionId: {
            name: 'revisionId',
            alias: 'revisionId',
            args: {},
            fieldsByTypeName: {}
          }
        }
      }
    }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('when a native id is not provided', () => {
    test('returns the parsed subscription results', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Request-Id': 'abcd-1234-efgh-5678'
        })
        .put(/ingest\/providers\/EDSC\/subscriptions\/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed/)
        .reply(201, {
          'concept-id': 'SUB100000-EDSC',
          'revision-id': '1'
        })

      const response = await subscriptionSourceIngest({
        collectionConceptId: 'C100000-EDSC',
        emailAddress: 'test@example.com',
        name: 'Test Subscription',
        query: 'polygon=-18,-78,-13,-74,-16,-73,-22,-77,-18,-78',
        subscriberId: 'testuser'
      }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        conceptId: 'SUB100000-EDSC',
        revisionId: '1'
      })
    })
  })

  describe('when a native id is provided', () => {
    test('returns the parsed subscription results', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Request-Id': 'abcd-1234-efgh-5678'
        })
        .put(/ingest\/providers\/EDSC\/subscriptions\/test-guid/)
        .reply(201, {
          'concept-id': 'SUB100000-EDSC',
          'revision-id': '1'
        })

      const response = await subscriptionSourceIngest({
        collectionConceptId: 'C100000-EDSC',
        emailAddress: 'test@example.com',
        name: 'Test Subscription',
        nativeId: 'test-guid',
        query: 'polygon=-18,-78,-13,-74,-16,-73,-22,-77,-18,-78',
        subscriberId: 'testuser'
      }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        conceptId: 'SUB100000-EDSC',
        revisionId: '1'
      })
    })
  })

  test('catches errors received from ingestCmr', async () => {
    nock(/example/)
      .put(/ingest\/providers\/EDSC\/subscriptions\/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed/)
      .reply(500, {
        errors: ['HTTP Error']
      }, {
        'cmr-request-id': 'abcd-1234-efgh-5678'
      })

    await expect(
      subscriptionSourceIngest({
        collectionConceptId: 'C100000-EDSC',
        emailAddress: 'test@example.com',
        name: 'Test Subscription',
        query: 'polygon=-18,-78,-13,-74,-16,-73,-22,-77,-18,-78',
        subscriberId: 'testuser'
      }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')
    ).rejects.toThrow(Error)
  })
})

describe('subscription#delete', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetAllMocks()

    jest.restoreAllMocks()

    process.env = { ...OLD_ENV }

    process.env.cmrRootUrl = 'http://example.com'

    // Default requestInfo
    requestInfo = {
      name: 'deleteSubscription',
      alias: 'deleteSubscription',
      args: {
        conceptId: 'SUB100000-EDSC',
        nativeId: 'test-guid'
      },
      fieldsByTypeName: {
        SubscriptionMutationResponse: {
          conceptId: {
            name: 'conceptId',
            alias: 'conceptId',
            args: {},
            fieldsByTypeName: {}
          },
          revisionId: {
            name: 'revisionId',
            alias: 'revisionId',
            args: {},
            fieldsByTypeName: {}
          }
        }
      }
    }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('when a native id is provided', () => {
    test('returns the parsed subscription results', async () => {
      nock(/example/)
        .defaultReplyHeaders({
          'CMR-Request-Id': 'abcd-1234-efgh-5678'
        })
        .delete(/ingest\/providers\/EDSC\/subscriptions\/test-guid/)
        .reply(201, {
          'concept-id': 'SUB100000-EDSC',
          'revision-id': '1'
        })

      const response = await subscriptionSourceDelete({
        conceptId: 'SUB100000-EDSC',
        nativeId: 'test-guid'
      }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')

      expect(response).toEqual({
        conceptId: 'SUB100000-EDSC',
        revisionId: '1'
      })
    })
  })

  test('catches errors received from cmrDelete', async () => {
    nock(/example/)
      .delete(/ingest\/providers\/EDSC\/subscriptions\/test-guid/)
      .reply(500, {
        errors: ['HTTP Error']
      }, {
        'cmr-request-id': 'abcd-1234-efgh-5678'
      })

    await expect(
      subscriptionSourceDelete({
        conceptId: 'C100000-EDSC',
        nativeId: 'test-guid'
      }, { 'CMR-Request-Id': 'abcd-1234-efgh-5678' }, requestInfo, 'subscription')
    ).rejects.toThrow(Error)
  })
})