// @flow
import { LIVE_STREAM_CHANNEL_CLAIM_ID, BITWAVE_API, BITWAVE_USERNAME, BITWAVE_EMBED_URL } from 'constants/livestream';
import React from 'react';
import { Lbry } from 'lbry-redux';
import classnames from 'classnames';
import FileTitle from 'component/fileTitle';
import Card from 'component/common/card';
import Spinner from 'component/spinner';
import DateTime from 'component/dateTime';
import CommentCreate from 'component/commentCreate';
import Button from 'component/button';

type Props = {
  uri: string,
  claim: ?StreamClaim,
};

export default function LivestreamFeed(props: Props) {
  const { claim, uri, doResolveUri } = props;
  const [fetchingComments, setFetchingComments] = React.useState(true);
  const [comments, setComments] = React.useState([]);
  const claimId = claim && claim.claim_id;

  React.useEffect(() => {
    if (uri) {
      doResolveUri(uri);
    }
  }, [uri, doResolveUri]);

  React.useEffect(() => {
    function fetchComments() {
      Lbry.comment_list({
        claim_id: claimId,
        page: 1,
        page_size: 200,
        include_replies: false,
        skip_validation: true,
      }).then(response => {
        const comments = response.items;
        if (comments) {
          setComments(comments);
        }
        setFetchingComments(false);
      });
    }

    let interval;
    if (claimId) {
      fetchComments();
      interval = setInterval(() => {
        fetchComments();
      }, 500000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [claimId]);

  if (!claim) {
    return null;
  }

  return (
    <>
      <div className={classnames('section card-stack')}>
        <div className={classnames('file-render file-render--video livestream', {})}>
          <div className="file-viewer">
            <iframe src={`${BITWAVE_EMBED_URL}/${BITWAVE_USERNAME}`} scrolling="no" />
          </div>
        </div>

        <FileTitle uri={uri} hideRepost />
      </div>
      <Card
        title="Live Discussion"
        smallTitle
        className="livestream__discussion"
        actions={
          <>
            {fetchingComments && (
              <div className="main--empty">
                <Spinner />
              </div>
            )}
            {!fetchingComments && comments.length > 0 ? (
              <div className="livestream__comments">
                {comments.map(comment => (
                  <div key={comment.comment_id} className="livestream__comment">
                    {comment.channel_url ? (
                      <Button
                        className="livestream__comment-author"
                        navigate={comment.channel_url}
                        label={comment.channel_name}
                      />
                    ) : (
                      <div className="livestream__comment-author">{comment.channel_name}</div>
                    )}
                    <div className="">{comment.comment}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="main--empty" />
            )}

            <div className="livestream__comment-create">
              <CommentCreate
                bottom
                uri={uri}
                onSubmit={(commentValue, channel) => {
                  const commentsWithStub = comments.slice();
                  commentsWithStub.unshift({
                    comment: commentValue,
                    channel_name: channel,
                    timestamp: Date.now() / 1000,
                    comment_id: Math.random(),
                  });

                  setComments(commentsWithStub);
                }}
              />
            </div>
          </>
        }
      />
    </>
  );
}
