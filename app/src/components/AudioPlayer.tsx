import React, { useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import WaveSurfer from 'wavesurfer.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

type Props = {
  audioUrl: string;
};

const AudioPlayer: React.FC<Props> = ({ audioUrl }) => {
  const [player, setPlayer] = useState<WaveSurfer | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [playerBtnElem, setPlayerBtnElem] = useState<React.ReactElement | null>(
    null,
  );

  useEffect(() => {
    if (ref.current == null) return;
    const wavesurfer = WaveSurfer.create({
      container: ref.current,
      height: 72,
      barWidth: 2,
      barHeight: 1,
    });
    wavesurfer.on('ready', () => {
      setLoading(false);
      setPlayerBtnElem(<FontAwesomeIcon icon={faPlay} />);
    });
    wavesurfer.on('play', () => {
      setPlayerBtnElem(<FontAwesomeIcon icon={faPause} />);
    });
    wavesurfer.on('pause', () => {
      setPlayerBtnElem(<FontAwesomeIcon icon={faPlay} />);
    });
    wavesurfer.load(audioUrl);
    setPlayer(wavesurfer);
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const handlePlayerBtnClick = useCallback(() => {
    if (player?.isPlaying()) {
      player?.pause();
    } else {
      player?.play();
    }
  }, [player]);

  return (
    <Wrapper>
      <ButtonWrapper>
        <Button
          type="primary"
          loading={loading}
          onClick={handlePlayerBtnClick}
          block
        >
          {playerBtnElem}
        </Button>
      </ButtonWrapper>
      <PlayerWrapper ref={ref} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  width: 50px;
`;

const PlayerWrapper = styled.div`
  width: 100%;
  margin-left: 10px;
`;

export default AudioPlayer;
