import styled from "styled-components";

const Container = styled.div`
  margin: 1em;
  border-radius: 5px;
  padding: 2em;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
`;

const Thumbnail = styled.div`
  margin-bottom: 1em;
`;

const Label = styled.div`
  font-size: 1em;
  color: #999;
  margin-bottom: 1em;
  margin-top: auto;
`;

const Action = styled.div`
  min-width: 8em;
  display: flex;

  button {
    width: 100%;
    flex: 1;
  }
`;

export const FeaturedCardImageWrapper = styled.div`
  height: 154px;
  width: 154px;
  display: flex;
  border-radius: 50%;
  overflow: hidden;
  img {
    object-fit: cover;
    width: 100%;
    transform: scale(1.1);
    transition: transform 1s;
  }
  &:hover {
    img {
      transform: scale(1.2);
    }
  }
`;

export const FeaturedCardStyles = {
  Container,
  Thumbnail,
  Label,
  Action,
};
