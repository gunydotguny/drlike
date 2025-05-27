import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    IconLookup,
    IconName,
    IconPrefix,
} from "@fortawesome/fontawesome-svg-core";
import { Badge, SxProps } from "@mui/material";
import { grey, red } from "@mui/material/colors";
import { MouseEventHandler } from "react";

type IconProps = {
    name: IconName;
    prefix?: IconPrefix;
    badgeCount?: number;
    size?: any;
    padding?: number;
    className?: string;
    color?: string;
    onClick?: MouseEventHandler<SVGSVGElement>;
    sx?: SxProps;
};

export default function Icon({
    name = "circle",
    prefix = "far",
    badgeCount,
    size = 24,
    padding = 2,
    className,
    color = grey[900],
    onClick,
    sx,
}: IconProps) {
    const icon: IconLookup = { prefix: prefix, iconName: name };
    const badgeInvisible = badgeCount === undefined;
    const badgeColor = red[400];
    return (
        <Badge
            max={999}
            invisible={badgeInvisible}
            badgeContent={badgeCount}
            variant="dot"
            overlap="circular"
            color="error"
            sx={{
                color: color,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: `${size}px !important`,
                padding: `${padding}px !important`,
                fontSize: `${(size - 4) / 2}px !important`,
                transition: `all 0.35s ease`,
                ...sx,
                "& .MuiBadge-badge": {
                    width: 6,
                    height: 6,
                    minWidth: 4,
                    backgroundColor: badgeColor,
                    fontSize: 12,
                    lineHeight: "16px",
                    fontWeight: "700",
                },
            }}
        >
            <FontAwesomeIcon
                icon={icon}
                size="2x"
                className={className}
                onClick={onClick}
            />
        </Badge>
    );
}
