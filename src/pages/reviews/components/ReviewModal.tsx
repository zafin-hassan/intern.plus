import React, { useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { default as AnimatedIcon } from "react-useanimations";
import { Helmet } from "react-helmet";

import { Size } from "src/theme/constants";
import { RouteName } from "src/utils/routes";
import { IReviewDetails } from "src/types";
import { GetReviewDetails } from "src/types/generated/GetReviewDetails";
import { GET_REVIEW_DETAILS } from "../graphql/queries";
import { buildReviewDetails } from "../graphql/utils";

import { Card, Text, StarRating, UnstyledButton } from "src/components";

/*******************************************************************
 *                  **Utility functions/constants**                *
 *******************************************************************/
const ERROR_OCCURRED_TEXT =
  "An error occurred while getting details for this review.";
const AUTHOR_SUFFIX = "mentioned the following...";

/**
 * Creates the markup for displaying the correct state of
 * the review details, whether still loading, etc.
 * @param loading whether job details are still loading
 * @param error whether fetching job details resulted in error
 * @param details data holding details about the job
 */
const getDetailsMarkup = (
  loading: boolean,
  error: boolean,
  details?: IReviewDetails
) => {
  if (loading) {
    return <AnimatedIcon className="loading" animationKey="loading" />;
  } else if (details) {
    return (
      <>
        <FlexRowContainer>
          <div>
            <Text variant="heading1" as="div">
              {details.jobName}
            </Text>
            <Text variant="heading3" as="div" color="greyDark">
              {`${details.companyName} | ${details.location}`}
            </Text>
          </div>
          <LogoImg
            src={details.logoSrc}
            alt={`Logo of ${details.companyName}`}
          />
        </FlexRowContainer>

        <ReviewPrefixContainer>
          <Text variant="subheading">{details.author}</Text>&nbsp;
          <Text variant="body" color="greyDark">
            {AUTHOR_SUFFIX}
          </Text>
        </ReviewPrefixContainer>

        <FlexRowContainer className="miscInfo">
          <div>
            <ReviewRating
              maxStars={5}
              filledStars={details.overallRating}
              readOnly
            >
              <Text variant="body" className="ratingText" color="greyDark">
                Overall
              </Text>
            </ReviewRating>
            <ReviewRating
              maxStars={5}
              filledStars={details.meaningfulWorkRating}
              readOnly
            >
              <Text variant="body" className="ratingText" color="greyDark">
                Meaningful work
              </Text>
            </ReviewRating>
            <ReviewRating
              maxStars={5}
              filledStars={details.workLifeBalanceRating}
              readOnly
            >
              <Text variant="body" className="ratingText" color="greyDark">
                Work life balance
              </Text>
            </ReviewRating>
            <ReviewRating
              maxStars={5}
              filledStars={details.learningMentorshipRating}
              readOnly
            >
              <Text variant="body" className="ratingText" color="greyDark">
                Learning &amp; mentorship
              </Text>
            </ReviewRating>
          </div>
          <SalaryInfo>
            <Text variant="heading2" as="div">
              {details.salary}
            </Text>
            <Text
              variant="heading3"
              as="div"
            >{`${details.salaryCurrency}/${details.salaryPeriod}`}</Text>
          </SalaryInfo>
        </FlexRowContainer>
        <Text className="reviewBody" variant="body">
          {details.body}
          {/* TODO: is there a way to render new lines without dangerouslySetInnerHTML? don't want to be exposed to XSS */}
        </Text>
      </>
    );
  }

  // error === true or something has gone horribly wrong
  return (
    <Text
      variant="subheading"
      className="error"
      color="error"
      as="div"
      align="center"
    >
      {ERROR_OCCURRED_TEXT}
    </Text>
  );
};
/*******************************************************************
 *                            **Styles**                           *
 *******************************************************************/
const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;

  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;

  background-color: rgba(40, 40, 40, 0.5);
`;

// TODO: i don't like the overflow scroll on the review body. too small area to read
const Container = styled(Card)`
  position: relative;
  max-height: 85vh;
  max-width: 900px;
  padding: 40px 60px;

  z-index: 201;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  & > .loading,
  & > .error {
    margin: auto;
  }

  & > .reviewBody {
    margin-top: 20px;
    overflow: scroll;
  }

  ${({ theme }) => theme.mediaQueries.medium`
    max-width: 80%;
  `}

  ${({ theme }) => theme.mediaQueries.tablet`
    & > .miscInfo {
      flex-direction: column;
    }
  `}

  ${({ theme }) => theme.mediaQueries.xlMobile`
    max-width: 90%;
    padding: 35px 40px;
  `}
`;

const FlexRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const LogoImg = styled.img`
  max-width: 80px;
`;

const ReviewRating = styled(StarRating)`
  display: flex;
  justify-content: flex-start;

  & > .ratingText {
    padding: 0 3px;
  }
`;

const SalaryInfo = styled.div`
  ${({ theme }) => theme.mediaQueries.tablet`
    display: flex;
    margin-top: 10px;
    
    & > * {
      font-size: ${theme.fontSize[Size.SMALL]}px;

      &:first-child::after {
        white-space: pre;
        content: " ";
      }
    }
  `}
`;

const ReviewPrefixContainer = styled.div`
  margin: 50px auto 10px 0;
`;

const CloseButton = styled(UnstyledButton)`
  position: absolute;
  width: 20px;
  height: 20px;
  top: -10px;
  right: -10px;

  cursor: pointer;

  background-color: ${({ theme }) => theme.color.error};
  border-radius: 50%;
`;

/*******************************************************************
 *                           **Component**                         *
 *******************************************************************/
const ReviewModal = () => {
  /**
   * If there is no background (usually when user navigates directly
   * to a review) then by default, show it on the landing page by
   * adding the state manually to set background page to landing.
   */
  const location = useLocation();
  const history = useHistory();
  const onExit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent default browser back behaviour
      history.goBack();
    },
    [history]
  );
  useEffect(() => {
    const noBackgroundPageSet = !(location.state && location.state.background);
    if (noBackgroundPageSet) {
      const defaultBackgroundPage = {
        pathname: RouteName.LANDING,
      };
      const newLocation = {
        ...location,
        state: {
          background: defaultBackgroundPage,
        },
      };

      history.replace(defaultBackgroundPage);
      history.push(newLocation);
    }
  }, []); // eslint-disable-line

  /**
   * Fetch the review with the corresponding id. Then, transform it
   * to something that's easier to work with.
   */
  const { reviewId } = useParams();
  const { loading, error, data } = useQuery<GetReviewDetails>(
    GET_REVIEW_DETAILS,
    {
      variables: { id: reviewId },
    }
  );
  const review = useMemo(
    () => (data && data.review ? buildReviewDetails(data.review) : undefined),
    [data]
  );

  /**
   * Stop clicks on card bubbling up to background and closing the modal.
   */
  const cardOnClick = useCallback(
    (e: React.MouseEvent) => e.stopPropagation(),
    []
  );

  return (
    <>
      <Helmet>
        <title>Review{review ? ` | ${review.jobName}` : ""}</title>
      </Helmet>
      <Background onClick={onExit}>
        <Container color="greyLight" onClick={cardOnClick}>
          {getDetailsMarkup(loading, error !== undefined, review)}
          <CloseButton onClick={onExit} />
        </Container>
      </Background>
    </>
  );
};

export default ReviewModal;