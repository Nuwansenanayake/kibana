/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';

import { SearchSourceProvider } from 'ui/courier/data_source/search_source';


function fetchAnchorProvider(courier, Private) {
  const SearchSource = Private(SearchSourceProvider);

  return async function fetchAnchor(indexPatternId, uid, sort) {
    const indexPattern = await courier.indexPatterns.get(indexPatternId);

    const searchSource = new SearchSource()
      .inherits(false)
      .set('index', indexPattern)
      .set('version', true)
      .set('size', 1)
      .set('query', {
        query: {
          terms: {
            _uid: [uid],
          }
        },
        language: 'lucene'
      })
      .set('sort', sort);

    const response = await searchSource.fetchAsRejectablePromise();

    if (_.get(response, ['hits', 'total'], 0) < 1) {
      throw new Error('Failed to load anchor document.');
    }

    return {
      ..._.get(response, ['hits', 'hits', 0]),
      $$_isAnchor: true,
    };
  };
}


export {
  fetchAnchorProvider,
};
