// @flow
import { LIVE_STREAM_CHANNEL_CLAIM_ID, BITWAVE_API, BITWAVE_USERNAME } from 'constants/livestream';
import React from 'react';
import Card from 'component/common/card';
import { Lbry } from 'lbry-redux';

type Props = {};

export default function LivestreamLink(props: Props) {
  const [hasLivestreamClaim, setHasLivestreamClaim] = React.useState(false);
  const [isLivestreaming, setIsLivestreaming] = React.useState(false);

  React.useEffect(() => {
    Lbry.claim_search({
      channel_ids: [LIVE_STREAM_CHANNEL_CLAIM_ID],
      any_tags: ['odysee-livestream'],
    })
      .then(res => {
        if (res && res.items && res.items.length > 0) {
          setHasLivestreamClaim(true);
        }
      })
      .catch(() => {});
  });

  React.useEffect(() => {
    if (hasLivestreamClaim) {
      fetch(`${BITWAVE_API}/${BITWAVE_USERNAME}`)
        .then(res => {
          console.log('res', res);
          if (res && res.data && res.data.live) {
            setIsLivestreaming(true);
          }
        })
        .catch(e => {
          console.log('e', e);
        });
    }
  }, [hasLivestreamClaim]);

  if (!hasLivestreamClaim || !isLivestreaming) {
    return null;
  }

  return (
    <>
      <Card
        className="livestream__channel-link"
        title="Live stream in progress"
        actions={<ClaimPreview uri="lbry://118bpm" />}
      />
    </>
  );
}
