<script lang="ts">
	import { goto } from '$app/navigation';

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement, event.submitter);
		const teamID = formData.get('teamID');
		goto(`/${teamID}`);
	}
</script>

<section>
	<header>
		<h1>ESEA.Team</h1>
	</header>

	<p>
		Navigate to a team's page on FACEIT and change
		<code>www.faceit.com/en/teams</code> →
		<code>esea.team</code> in your address bar.
	</p>

	<form on:submit={handleSubmit}>
		<label>
			Or paste a team's ID from FACEIT
			<input
				type="text"
				name="teamID"
				required
				placeholder="00000000-0000-0000-0000-000000000000"
			/>
		</label>
		<button type="submit">Submit</button>
	</form>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 5rem;
		min-height: 80vh;
	}

	p {
		font-size: 1.1rem;
	}

	code {
		font-size: 1.1rem;
		padding: 0 0.35rem;
		background-color: #333;
		border: 1px solid #444;
		border-radius: 2px;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		text-align: center;
	}

	form {
		display: flex;
		justify-content: center;
		align-items: end;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	label input {
		margin-top: 0.25rem;
		display: block;
		width: 18.5rem;
	}
</style>
