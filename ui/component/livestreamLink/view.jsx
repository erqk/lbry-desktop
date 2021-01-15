// @flow
import { LIVE_STREAM_CHANNEL_CLAIM_ID, BITWAVE_API, BITWAVE_USERNAME } from 'constants/livestream';
import React from 'react';
import Card from 'component/common/card';
import ClaimPreview from 'component/claimPreview';
import { Lbry } from 'lbry-redux';

type Props = {};

export default function LivestreamLink(props: Props) {
  const [livestreamClaimUrl, setLivestreamClaimUrl] = React.useState(false);
  const [isLivestreaming, setIsLivestreaming] = React.useState(false);

  React.useEffect(() => {
    Lbry.claim_search({
      channel_ids: [LIVE_STREAM_CHANNEL_CLAIM_ID],
      any_tags: ['odysee-livestream'],
    })
      .then(res => {
        if (res && res.items && res.items.length > 0) {
          const claimUrl = res.items[0].canonical_url;
          setLivestreamClaimUrl(claimUrl);
        }
      })
      .catch(() => {});
  });

  React.useEffect(() => {
    let interval;
    if (livestreamClaimUrl) {
      function fetchIsStreaming() {
        fetch(`${BITWAVE_API}/${BITWAVE_USERNAME}`)
          .then(res => res.json())
          .then(res => {
            if (res && res.data && res.data.live) {
              setIsLivestreaming(true);
            }
          })
          .catch(e => {
            console.log('e', e);
          });
      }

      interval = setInterval(fetchIsStreaming, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [livestreamClaimUrl]);

  if (!livestreamClaimUrl || !isLivestreaming) {
    return null;
  }

  return (
    <>
      <Card
        className="livestream__channel-link"
        title="Live stream in progress"
        actions={<ClaimPreview uri={livestreamClaimUrl} />}
      />
    </>
  );
}
