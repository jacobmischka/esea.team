<script lang="ts">
	import type { Member } from '$lib/schemas';
	import { replaceLang } from '$lib/utils';
	import { assets } from '$app/paths';

	export let member: Member;
	export let count: number | undefined = undefined;
	export let percentage: number | undefined = undefined;
</script>

<div class="member">
	<img src={member.avatar || `${assets}/avatar.svg`} alt="" />
	<div class="member-info">
		{#if member.faceit_url}
			<a class="name" href={replaceLang(member.faceit_url)}>
				{member.nickname}
			</a>
		{:else}
			<span class="name">
				{member.nickname}
			</span>
		{/if}
		{#if member.skill_level || count || percentage}
			<dl>
				{#if member.skill_level}
					<div>
						<dt>Level</dt>
						<dd>
							{member.skill_level}
						</dd>
					</div>
				{/if}
				{#if count || percentage}
					<div>
						<dt>Matches</dt>
						<dd>
							{#if count}
								{count}
							{/if}
							{#if percentage}
								{#if count}
									({percentage}%)
								{:else}
									{percentage}%
								{/if}
							{/if}
						</dd>
					</div>
				{/if}
			</dl>
		{/if}
	</div>
</div>

<style>
	.member {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0.25rem;
		border: 1px solid var(--border-color);
		border-radius: 2px;
	}

	.member-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.name {
		font-size: 1.1rem;
	}

	img {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	dl {
		display: flex;
		flex-direction: column;
		margin: 0;
	}

	dl > div {
		display: flex;
		justify-content: space-between;
		gap: 0.25rem;
	}
</style>
