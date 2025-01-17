import React, { useMemo } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames";
import { Location } from "history";

import { hoverStyles, itemCardStyles } from "src/theme/snippets";
import { getPrimaryColor } from "src/shared/utils/color";

import Tag from "src/components/Tag";
import StarRating from "src/components/StarRating";
import Text from "src/components/Text";
import Card, { ICardProps } from "../RawCard";
import useDarkMode from "use-dark-mode";

/*******************************************************************
 *                            **Types**                            *
 *******************************************************************/
export interface IReviewCardProps extends ICardProps {
  heading: string;
  subheading: string;
  rating: number;
  linkTo: string;
  tags?: { label: string; bgColor?: string; color?: string }[];
}

/*******************************************************************
 *                            **Styles**                           *
 *******************************************************************/
const Container = styled(Card)`
  position: relative;
  ${hoverStyles}

  & > a {
    ${itemCardStyles}

    display: inline-grid;
    grid-template-rows: auto auto 1fr auto;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "heading     rating"
      "subheading  subheading"
      "contents    contents"
      "tags        tags";

    text-decoration: none;

    & > .heading {
      grid-area: heading;

      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    & > .rating {
      grid-area: rating;
    }

    & > .subheading {
      grid-area: subheading;
      padding-top: 5px;

      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    & > .contents {
      grid-area: contents;
      padding-top: 10px;

      overflow: hidden;
      mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 1),
        rgba(0, 0, 0, 1),
        rgba(0, 0, 0, 0)
      );
    }

    & > .tags {
      padding-top: 10px;

      & .tag {
        margin-right: 5px;
      }
    }
  }
`;

/*******************************************************************
 *                           **Component**                         *
 *******************************************************************/
const ReviewCard: React.FC<IReviewCardProps> = ({
  className,
  heading,
  subheading,
  rating,
  color,
  linkTo,
  tags,
  children,
  ...rest
}) => {
  /**
   * Go to review page while setting state
   * so that the current page now becomes the
   * background for the review modal.
   */
  const location = useLocation<{ background: Location }>();
  const linkToWithState = useMemo(
    () => ({
      pathname: linkTo,
      state: {
        background: location,
      },
      search: location.search,
    }),
    [linkTo, location]
  );

  const { value: isDark } = useDarkMode();
  return (
    <Container
      className={classNames("review-card", className)}
      color="backgroundSecondary"
      {...rest}
    >
      <Link to={linkToWithState} tabIndex={0}>
        <Text
          variant="heading3"
          className="heading"
          color={getPrimaryColor(isDark, color)}
        >
          {heading}
        </Text>

        <Text className="subheading" variant="heading4" color="textSecondary">
          {subheading}
        </Text>
        <StarRating maxStars={5} value={rating || 0} readOnly />
        <div className="contents">{children}</div>
        {tags && (
          <div className="tags">
            {tags.map(({ label, bgColor, color }) => (
              <Tag key={label} color={bgColor}>
                <Text size={12} bold={500} color={color}>
                  {label}
                </Text>
              </Tag>
            ))}
          </div>
        )}
      </Link>
    </Container>
  );
};

export default React.memo(ReviewCard);
