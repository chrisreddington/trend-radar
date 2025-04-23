// src/components/ViewSourceOnGitHub.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/router";

interface ViewSourceOnGitHubProperties {
  /** URL of the GitHub repository or file to view */
  repoUrl: string;
  /** Optional aria-label for the link */
  ariaLabel?: string;
}

/**
 * Renders a link to view source on GitHub, switching logos for light/dark mode.
 */
export function ViewSourceOnGitHub({
  repoUrl,
  ariaLabel = "View source on GitHub",
}: ViewSourceOnGitHubProperties) {
  const { basePath } = useRouter();
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col items-center gap-4">
        <Link
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="flex flex-col items-center gap-2 inline-block"
        >
          <span className="flex justify-center items-center gap-2">
            {/* Light mode logo */}
            <Image
              src={`${basePath}/github-mark.png`}
              alt="GitHub logo"
              width={24}
              height={24}
              className="dark:hidden w-6 h-6"
            />
            {/* Dark mode logo */}
            <Image
              src={`${basePath}/github-mark-white.png`}
              alt="GitHub logo"
              width={24}
              height={24}
              className="hidden dark:block w-6 h-6"
            />
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            View Source
          </span>
        </Link>
      </div>
    </div>
  );
}
